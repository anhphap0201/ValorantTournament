const Match = require("../models/match.js");
const Team = require("../models/team.js");

const matchController = {
  getMatchesByTournament: async (req, res) => {
    try {
      const tournamentId = req.params.id;
      const list = await Match.getAllByTournamentId(tournamentId);
      res.status(200).json(list);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi khi lấy danh sách trận đấu." });
    }
  },

  generateSchedule: async (req, res) => {
    try {
      const tournamentId = req.params.id;
      
      // Get registered teams for this tournament
      const teams = await Team.getAll(tournamentId);
      
      if (teams.length !== 8) {
        return res.status(400).json({ 
          error: `Giải đấu phải có đúng 8 đội tuyển tham gia để xếp cặp đấu theo thể thức Round Robin. Hiện tại có ${teams.length} đội.` 
        });
      }

      // Delete existing matches first
      await Match.deleteByTournamentId(tournamentId);

      // Reset team points, wins, losses
      for (const team of teams) {
        await Team.update(team.id, { points: 0, wins: 0, losses: 0 });
      }

      // Generate round robin schedule using Circle Method
      const N = 8;
      const rounds = N - 1; // 7 rounds
      const matchesPerRound = N / 2; // 4 matches per round
      const matchesToCreate = [];

      const teamList = [...teams];

      for (let r = 0; r < rounds; r++) {
        for (let m = 0; m < matchesPerRound; m++) {
          const homeIdx = m;
          const awayIdx = N - 1 - m;

          const teamA = teamList[homeIdx];
          const teamB = teamList[awayIdx];

          matchesToCreate.push({
            tournament_id: tournamentId,
            round: r + 1,
            team_a_id: teamA.id,
            team_b_id: teamB.id,
            team_a_score: 0,
            team_b_score: 0,
            status: 'pending',
            stage: 'round_robin',
            match_order: m + 1
          });
        }

        // Rotate teamList (keep index 0 fixed, rotate the rest clockwise)
        const temp = teamList[N - 1];
        for (let i = N - 1; i > 1; i--) {
          teamList[i] = teamList[i - 1];
        }
        teamList[1] = temp;
      }

      const createdMatches = await Match.createMatches(matchesToCreate);
      res.status(201).json({
        message: "Xếp cặp đấu vòng tròn tính điểm thành công!",
        matches: createdMatches
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi khi tự động xếp cặp đấu." });
    }
  },

  updateMatchScore: async (req, res) => {
    try {
      const matchId = req.params.matchId;
      const { team_a_score, team_b_score, status } = req.body;

      if (team_a_score === undefined || team_b_score === undefined) {
        return res.status(400).json({ error: "Vui lòng điền đầy đủ tỉ số." });
      }

      const scoreA = parseInt(team_a_score, 10);
      const scoreB = parseInt(team_b_score, 10);

      if (!((scoreA === 1 && scoreB === 0) || (scoreA === 0 && scoreB === 1))) {
        return res.status(400).json({ error: "Tỉ số trận đấu chỉ có thể là 1-0 hoặc 0-1." });
      }

      const matchBefore = await Match.getById(matchId);
      if (!matchBefore) {
        return res.status(404).json({ error: "Không tìm thấy trận đấu." });
      }

      // Determine winner based on score
      let winner_id = null;
      if (scoreA > scoreB) {
        winner_id = matchBefore.team_a_id;
      } else if (scoreB > scoreA) {
        winner_id = matchBefore.team_b_id;
      }

      // Update match
      const matchAfter = await Match.update(matchId, {
        team_a_score: scoreA,
        team_b_score: scoreB,
        status: status || 'completed',
        winner_id: winner_id
      });

      // Update team points if stage is round robin
      if (matchAfter.stage === 'round_robin') {
        // Revert points from previous result if match was already completed
        if (matchBefore.status === 'completed' && matchBefore.winner_id) {
          const oldWinnerId = matchBefore.winner_id;
          const oldLoserId = oldWinnerId === matchBefore.team_a_id ? matchBefore.team_b_id : matchBefore.team_a_id;

          const oldWinner = await Team.getById(oldWinnerId);
          const oldLoser = await Team.getById(oldLoserId);

          if (oldWinner) {
            await Team.update(oldWinnerId, {
              points: Math.max(0, (oldWinner.points || 0) - 1),
              wins: Math.max(0, (oldWinner.wins || 0) - 1)
            });
          }
          if (oldLoser) {
            await Team.update(oldLoserId, {
              losses: Math.max(0, (oldLoser.losses || 0) - 1)
            });
          }
        }

        // Apply new points
        if (matchAfter.status === 'completed' && winner_id) {
          const newWinnerId = winner_id;
          const newLoserId = newWinnerId === matchAfter.team_a_id ? matchAfter.team_b_id : matchAfter.team_a_id;

          const newWinner = await Team.getById(newWinnerId);
          const newLoser = await Team.getById(newLoserId);

          if (newWinner) {
            await Team.update(newWinnerId, {
              points: (newWinner.points || 0) + 1,
              wins: (newWinner.wins || 0) + 1
            });
          }
          if (newLoser) {
            await Team.update(newLoserId, {
              losses: (newLoser.losses || 0) + 1
            });
          }
        }
      }

      res.status(200).json({
        message: "Cập nhật tỉ số trận đấu thành công!",
        match: matchAfter
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi khi cập nhật tỉ số trận đấu." });
    }
  },

  finalizeStandings: async (req, res) => {
    try {
      const tournamentId = req.params.id;

      // Get teams for this tournament
      const teams = await Team.getAll(tournamentId);
      if (teams.length < 4) {
        return res.status(400).json({ error: "Giải đấu cần có ít nhất 4 đội để chốt bảng điểm." });
      }

      // Sort teams by points DESC, then wins DESC, then team_id ASC
      const sortedTeams = [...teams].sort((a, b) => {
        if ((b.points || 0) !== (a.points || 0)) {
          return (b.points || 0) - (a.points || 0);
        }
        if ((b.wins || 0) !== (a.wins || 0)) {
          return (b.wins || 0) - (a.wins || 0);
        }
        return a.id - b.id;
      });

      // Clear existing playoff matches (semi_final, third_place, and final)
      await Match.deleteMatchesByStage(tournamentId, 'semi_final');
      await Match.deleteMatchesByStage(tournamentId, 'third_place');
      await Match.deleteMatchesByStage(tournamentId, 'final');

      // Create Semi-Final matches
      // SF1: 1st (index 0) vs 4th (index 3)
      // SF2: 2nd (index 1) vs 3rd (index 2)
      const sfMatches = [
        {
          tournament_id: tournamentId,
          round: 1,
          team_a_id: sortedTeams[0].id,
          team_b_id: sortedTeams[3].id,
          team_a_score: 0,
          team_b_score: 0,
          status: 'pending',
          stage: 'semi_final',
          match_order: 1
        },
        {
          tournament_id: tournamentId,
          round: 1,
          team_a_id: sortedTeams[1].id,
          team_b_id: sortedTeams[2].id,
          team_a_score: 0,
          team_b_score: 0,
          status: 'pending',
          stage: 'semi_final',
          match_order: 2
        }
      ];

      const createdPlayoffs = await Match.createMatches(sfMatches);

      res.status(200).json({
        message: "Chốt bảng điểm thành công! Đã tạo các trận bán kết.",
        matches: createdPlayoffs
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi khi chốt bảng điểm." });
    }
  },

  selectPlayoffWinner: async (req, res) => {
    try {
      const matchId = req.params.matchId;
      const { winner_id } = req.body;

      if (!winner_id) {
        return res.status(400).json({ error: "Vui lòng chọn đội thắng." });
      }

      const match = await Match.getById(matchId);
      if (!match) {
        return res.status(404).json({ error: "Không tìm thấy trận đấu." });
      }

      // Determine score for playoff
      const team_a_score = winner_id == match.team_a_id ? 1 : 0;
      const team_b_score = winner_id == match.team_b_id ? 1 : 0;

      const updatedMatch = await Match.update(matchId, {
        team_a_score,
        team_b_score,
        status: 'completed',
        winner_id
      });

      // If it is semi_final, check if we can generate or update the Final and Third-Place matches
      if (updatedMatch.stage === 'semi_final') {
        const tournamentMatches = await Match.getAllByTournamentId(updatedMatch.tournament_id);
        const sfMatches = tournamentMatches.filter(m => m.stage === 'semi_final');
        const finalMatches = tournamentMatches.filter(m => m.stage === 'final');
        const thirdPlaceMatches = tournamentMatches.filter(m => m.stage === 'third_place');

        const allSFCompleted = sfMatches.every(m => m.status === 'completed' && m.winner_id);

        if (allSFCompleted) {
          const sf1 = sfMatches.find(m => m.match_order === 1);
          const sf2 = sfMatches.find(m => m.match_order === 2);

          const winner1 = sf1.winner_id;
          const winner2 = sf2.winner_id;
          
          const loser1 = sf1.winner_id == sf1.team_a_id ? sf1.team_b_id : sf1.team_a_id;
          const loser2 = sf2.winner_id == sf2.team_a_id ? sf2.team_b_id : sf2.team_a_id;

          // Handle Final Match
          if (finalMatches.length > 0) {
            await Match.update(finalMatches[0].id, {
              team_a_score: 0,
              team_b_score: 0,
              status: 'pending',
              winner_id: null,
              team_a_id: winner1,
              team_b_id: winner2
            });
          } else {
            await Match.createMatches([{
              tournament_id: updatedMatch.tournament_id,
              round: 1,
              team_a_id: winner1,
              team_b_id: winner2,
              team_a_score: 0,
              team_b_score: 0,
              status: 'pending',
              stage: 'final',
              match_order: 1
            }]);
          }

          // Handle Third Place Match
          if (thirdPlaceMatches.length > 0) {
            await Match.update(thirdPlaceMatches[0].id, {
              team_a_score: 0,
              team_b_score: 0,
              status: 'pending',
              winner_id: null,
              team_a_id: loser1,
              team_b_id: loser2
            });
          } else {
            await Match.createMatches([{
              tournament_id: updatedMatch.tournament_id,
              round: 1,
              team_a_id: loser1,
              team_b_id: loser2,
              team_a_score: 0,
              team_b_score: 0,
              status: 'pending',
              stage: 'third_place',
              match_order: 1
            }]);
          }
        }
      }

      res.status(200).json({
        message: "Chọn đội thắng thành công!",
        match: updatedMatch
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi khi chọn đội thắng." });
    }
  },

  updateTeamPoints: async (req, res) => {
    try {
      const teamId = req.params.teamId;
      const { points, wins, losses } = req.body;

      const updatedTeam = await Team.update(teamId, {
        points: parseInt(points, 10) || 0,
        wins: parseInt(wins, 10) || 0,
        losses: parseInt(losses, 10) || 0
      });

      res.status(200).json({
        message: "Cập nhật điểm số đội tuyển thành công!",
        team: updatedTeam
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi khi cập nhật điểm số trực tiếp." });
    }
  }
};

module.exports = matchController;
