const Match = require("../models/match.js");
const Team = require("../models/team.js");
const Tournament = require("../models/tournament.js");

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
      
      const tournament = await Tournament.getById(tournamentId);
      if (!tournament) {
        return res.status(404).json({ error: "Không tìm thấy giải đấu." });
      }

      // Get registered teams for this tournament
      const teams = await Team.getAll(tournamentId);
      
      if (tournament.format === 'Swiss') {
        if (teams.length < 2 || teams.length % 2 !== 0) {
          return res.status(400).json({ 
            error: `Giải đấu phải có số lượng đội tuyển chẵn (ví dụ: 8 đội) để xếp cặp đấu theo thể thức Swiss. Hiện tại có ${teams.length} đội.` 
          });
        }

        const { swissWinsRequired, swissLossesRequired } = req.body;
        const winsRequired = parseInt(swissWinsRequired, 10) || 3;
        const lossesRequired = parseInt(swissLossesRequired, 10) || 3;

        // Save Swiss configuration
        await Tournament.update(tournamentId, {
          name: tournament.name,
          description: tournament.description,
          startDate: tournament.start_date,
          endDate: tournament.end_date,
          format: tournament.format,
          maxTeams: tournament.max_teams,
          prizePool: tournament.prize_pool,
          status: tournament.status,
          swiss_wins_required: winsRequired,
          swiss_losses_required: lossesRequired
        });

        // Delete existing matches first
        await Match.deleteByTournamentId(tournamentId);

        // Reset team points, wins, losses
        for (const team of teams) {
          await Team.update(team.id, { points: 0, wins: 0, losses: 0 });
        }

        // Generate Round 1 pairings (pair in order of registration/id: 1 vs 2, 3 vs 4, etc.)
        const matchesToCreate = [];
        for (let i = 0; i < teams.length; i += 2) {
          matchesToCreate.push({
            tournament_id: tournamentId,
            round: 1,
            team_a_id: teams[i].id,
            team_b_id: teams[i + 1].id,
            team_a_score: 0,
            team_b_score: 0,
            status: 'pending',
            stage: 'swiss',
            match_order: (i / 2) + 1
          });
        }

        const createdMatches = await Match.createMatches(matchesToCreate);
        return res.status(201).json({
          message: "Xếp cặp đấu Vòng 1 thể thức Swiss thành công!",
          matches: createdMatches
        });
      }

      // Default to Round Robin if not Swiss
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
      const { team_a_score, team_b_score, status, match_time } = req.body;

      const matchBefore = await Match.getById(matchId);
      if (!matchBefore) {
        return res.status(404).json({ error: "Không tìm thấy trận đấu." });
      }

      const updateData = {};
      if (match_time !== undefined) {
        updateData.match_time = match_time || null;
      }

      const scoreProvided = team_a_score !== undefined && team_b_score !== undefined;
      let winner_id = null;

      if (scoreProvided) {
        const scoreA = parseInt(team_a_score, 10);
        const scoreB = parseInt(team_b_score, 10);

        if (!((scoreA === 1 && scoreB === 0) || (scoreA === 0 && scoreB === 1))) {
          return res.status(400).json({ error: "Tỉ số trận đấu chỉ có thể là 1-0 hoặc 0-1." });
        }

        updateData.team_a_score = scoreA;
        updateData.team_b_score = scoreB;
        updateData.status = status || 'completed';

        if (scoreA > scoreB) {
          winner_id = matchBefore.team_a_id;
        } else if (scoreB > scoreA) {
          winner_id = matchBefore.team_b_id;
        }
        updateData.winner_id = winner_id;
      }

      // Update match
      const matchAfter = await Match.update(matchId, updateData);

      // Update team points if stage is round robin or swiss AND score was updated
      if (scoreProvided && (matchAfter.stage === 'round_robin' || matchAfter.stage === 'swiss')) {
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
        message: "Cập nhật trận đấu thành công!",
        match: matchAfter
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi khi cập nhật trận đấu." });
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
  },

  generateNextRound: async (req, res) => {
    try {
      const tournamentId = req.params.id;
      
      const tournament = await Tournament.getById(tournamentId);
      if (!tournament) {
        return res.status(404).json({ error: "Không tìm thấy giải đấu." });
      }

      if (tournament.format !== 'Swiss') {
        return res.status(400).json({ error: "Thể thức giải đấu không phải là Swiss." });
      }

      const winsRequired = tournament.swiss_wins_required || 3;
      const lossesRequired = tournament.swiss_losses_required || 3;

      // Get all matches for this tournament
      const allMatches = await Match.getAllByTournamentId(tournamentId);
      const swissMatches = allMatches.filter(m => m.stage === 'swiss');

      if (swissMatches.length === 0) {
        return res.status(400).json({ error: "Chưa khởi tạo vòng 1 của giải đấu. Vui lòng bấm xếp cặp đấu trước." });
      }

      // Check if there are any pending matches in the current round
      const currentRoundNum = Math.max(...swissMatches.map(m => m.round));
      const currentRoundMatches = swissMatches.filter(m => m.round === currentRoundNum);
      const hasPendingMatches = currentRoundMatches.some(m => m.status === 'pending');
      
      if (hasPendingMatches) {
        return res.status(400).json({ 
          error: `Vui lòng hoàn thành tất cả các trận đấu của Vòng ${currentRoundNum} trước khi tạo vòng tiếp theo.` 
        });
      }

      // Get all teams
      const teams = await Team.getAll(tournamentId);

      // Calculate each team's record based on all COMPLETED swiss matches
      const teamStats = {};
      for (const t of teams) {
        teamStats[t.id] = {
          id: t.id,
          name: t.name,
          logo: t.logo,
          wins: 0,
          losses: 0,
          opponents: new Set(),
          hasHadBye: false
        };
      }

      for (const m of swissMatches) {
        if (m.status === 'completed' && m.winner_id) {
          const winnerId = m.winner_id;
          const loserId = winnerId === m.team_a_id ? m.team_b_id : m.team_a_id;
          
          if (teamStats[winnerId]) teamStats[winnerId].wins += 1;
          if (loserId && teamStats[loserId]) teamStats[loserId].losses += 1;
        }
        
        if (m.team_a_id && m.team_b_id) {
          if (teamStats[m.team_a_id]) teamStats[m.team_a_id].opponents.add(m.team_b_id);
          if (teamStats[m.team_b_id]) teamStats[m.team_b_id].opponents.add(m.team_a_id);
        } else if (m.team_a_id && !m.team_b_id) {
          if (teamStats[m.team_a_id]) teamStats[m.team_a_id].hasHadBye = true;
        }
      }

      // Identify active teams
      const activeTeams = Object.values(teamStats).filter(
        t => t.wins < winsRequired && t.losses < lossesRequired
      );

      if (activeTeams.length === 0) {
        return res.status(200).json({ 
          message: "Giai đoạn vòng bảng Swiss đã kết thúc! Tất cả các đội đều đã đủ điều kiện đi tiếp hoặc bị loại.",
          swissCompleted: true
        });
      }

      // Sort descending by wins, ascending by losses
      activeTeams.sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return a.losses - b.losses;
      });

      let bestPairing = null;
      let minPenalty = Infinity;

      const findBestPairing = (unpaired, currentPairings, currentPenalty) => {
        // Pruning: if current penalty is already worse than the best found, stop
        if (currentPenalty >= minPenalty) return;

        if (unpaired.length === 0) {
          if (currentPenalty < minPenalty) {
            minPenalty = currentPenalty;
            bestPairing = [...currentPairings];
          }
          return;
        }

        if (unpaired.length === 1) {
          const t1 = unpaired[0];
          // BYE has a penalty: heavily penalize multiple BYEs, prefer lowest wins
          const byePenalty = (t1.hasHadBye ? 1000000 : 0) + (t1.wins * 1000);
          if (currentPenalty + byePenalty < minPenalty) {
            minPenalty = currentPenalty + byePenalty;
            bestPairing = [...currentPairings, { team_a: t1, team_b: null }];
          }
          return;
        }

        const t1 = unpaired[0];
        const candidates = unpaired.slice(1);

        for (const t2 of candidates) {
          const diffWins = Math.abs(t1.wins - t2.wins);
          const diffLosses = Math.abs(t1.losses - t2.losses);
          const hasMet = t1.opponents.has(t2.id);
          // Penalty is wins difference squared (primary), losses difference squared, plus a small penalty for repeat matches
          const matchPenalty = diffWins * diffWins * 10 + diffLosses * diffLosses + (hasMet ? 5 : 0);

          const remaining = unpaired.filter(t => t.id !== t1.id && t.id !== t2.id);
          findBestPairing(remaining, [...currentPairings, { team_a: t1, team_b: t2 }], currentPenalty + matchPenalty);
        }
      };

      findBestPairing(activeTeams, [], 0);
      const pairings = bestPairing;

      if (!pairings) {
        return res.status(400).json({ 
          error: "Không thể tạo cặp đấu hợp lệ cho vòng này vì cản trở bởi lịch sử đối đầu (các đội đã gặp nhau hết). Vui lòng điều chỉnh bảng xếp hạng hoặc liên hệ kỹ thuật." 
        });
      }

      // Create next round matches
      const nextRoundNum = currentRoundNum + 1;
      const matchesToCreate = pairings.map((p, idx) => {
        return {
          tournament_id: tournamentId,
          round: nextRoundNum,
          team_a_id: p.team_a.id,
          team_b_id: p.team_b ? p.team_b.id : null,
          team_a_score: 0,
          team_b_score: 0,
          status: p.team_b ? 'pending' : 'completed',
          winner_id: p.team_b ? null : p.team_a.id,
          stage: 'swiss',
          match_order: idx + 1
        };
      });

      const createdMatches = await Match.createMatches(matchesToCreate);

      // If there was a BYE, update the team's wins/points in database
      for (const m of matchesToCreate) {
        if (!m.team_b_id) {
          const team = await Team.getById(m.team_a_id);
          if (team) {
            await Team.update(m.team_a_id, {
              points: (team.points || 0) + 1,
              wins: (team.wins || 0) + 1,
              losses: team.losses || 0
            });
          }
        }
      }

      res.status(201).json({
        message: `Tạo cặp đấu Vòng ${nextRoundNum} thành công!`,
        matches: createdMatches
      });
    } catch (error) {
      console.error("Lỗi khi tạo vòng tiếp theo:", error);
      res.status(500).json({ error: "Lỗi hệ thống khi tạo vòng tiếp theo." });
    }
  }
};

module.exports = matchController;
