import valorantImg from "@/assets/valorant.jpg";
import bgmiImg from "@/assets/bgmi.jpg";
import mlImg from "@/assets/ml.jpg";
import freefireImg from "@/assets/freefire.jpg";
import codImg from "@/assets/cod.jpg";
import type { Bracket } from "@/types/bracket";

export type EventStatus = "live" | "past";

export type RankingRow = {
  rank: number;
  team: string;
  points: number;
  prize?: string;
};

export type EventGame = {
  id: string;
  name: string;
  image: string;
  format?: "points" | "bracket";
  rankings: RankingRow[];
  bracket?: Bracket;
};

export type Event = {
  id: string;
  title: string;
  date: string;
  location: string;
  participants: number;
  prize: string;
  status: EventStatus;
  image: string;
  games: EventGame[];
};

export const events: Event[] = [
  {
    id: "ewc-2025",
    title: "Esports Week 2025",
    date: "Oct 12, 2025",
    location: "Online",
    participants: 64,
    prize: "₹10,000",
    status: "live",
    image: valorantImg,
    games: [
      {
        id: "valorant",
        name: "Valorant",
        image: valorantImg,
        format: "bracket",
        rankings: [],
        bracket: {
          columns: [
            {
              title: "Upper • Initial Match",
              matches: [
                {
                  teamA: "Gen.G Esports",
                  teamB: "EDward Gaming",
                  scoreA: 1,
                  scoreB: 0,
                  status: "completed",
                  time: "Tue, Jul 2 - 5:30 PM",
                },
                {
                  teamA: "100 Thieves",
                  teamB: "FNATIC",
                  scoreA: 0,
                  scoreB: 1,
                  status: "completed",
                  time: "Tue, Jul 2 - 5:30 PM",
                },
              ],
            },
            {
              title: "Upper • Winner Match",
              matches: [
                {
                  teamA: "Gen.G Esports",
                  teamB: "FNATIC",
                  scoreA: 0,
                  scoreB: 2,
                  status: "completed",
                  time: "Tue, Jul 2 - 9:45 PM",
                },
              ],
            },
            {
              title: "Lower • Elimination",
              matches: [
                {
                  teamA: "100 Thieves",
                  teamB: "EDward Gaming",
                  scoreA: 1,
                  scoreB: 2,
                  status: "completed",
                  time: "Wed, Jul 3 - 6:00 PM",
                },
              ],
            },
            {
              title: "Lower • Decider",
              matches: [
                {
                  teamA: "Gen.G Esports",
                  teamB: "EDward Gaming",
                  scoreA: 2,
                  scoreB: 0,
                  status: "completed",
                  time: "Thu, Jul 4 - 8:00 PM",
                },
              ],
            },
          ],
          winner: undefined,
        },
      },
      {
        id: "freefire",
        name: "Free Fire",
        image: freefireImg,
        format: "points",
        rankings: [
          { rank: 1, team: "Skylights", points: 220, prize: "₹3,000" },
          { rank: 2, team: "OR Esports", points: 185, prize: "₹2,000" },
          { rank: 3, team: "GodLike", points: 160, prize: "₹1,000" },
        ],
      },
      {
        id: "bgmi",
        name: "BGMI",
        image: bgmiImg,
        format: "points",
        rankings: [
          { rank: 1, team: "Soul", points: 280, prize: "₹3,000" },
          { rank: 2, team: "Gods Reign", points: 240, prize: "₹2,000" },
          { rank: 3, team: "Entity", points: 210, prize: "₹1,000" },
        ],
      },
      {
        id: "codm",
        name: "COD Mobile",
        image: codImg,
        format: "bracket",
        rankings: [],
        bracket: {
          columns: [
            {
              title: "Quarterfinal",
              matches: [
                { teamA: "OpTic", teamB: "100 Thieves", scoreA: 3, scoreB: 1, status: "completed", time: "Sun, Jul 27 - 10:00 AM" },
                { teamA: "Boston Breach", teamB: "Team Heretics", scoreA: 1, scoreB: 3, status: "completed", time: "Sat, Jul 26 - 7:00 PM" },
                { teamA: "Movistar KOI", teamB: "Vancouver Surge", scoreA: 1, scoreB: 3, status: "completed", time: "Sat, Jul 26 - 10:30 PM" },
              ],
            },
            {
              title: "Semifinal",
              matches: [
                { teamA: "Team Heretics", teamB: "OpTic", scoreA: 2, scoreB: 3, status: "completed", time: "Sun, Jul 27 - 9:00 PM" },
                { teamA: "Vancouver Surge", teamB: "Movistar KOI", scoreA: 3, scoreB: 2, status: "completed", time: "Sun, Jul 27 - 7:30 PM" },
              ],
            },
            {
              title: "Grand Final",
              matches: [
                { teamA: "Vancouver Surge", teamB: "OpTic", scoreA: 0, scoreB: 4, status: "completed", time: "Mon, Jul 28 - 12:05 AM" },
              ],
            },
          ],
          winner: "OpTic",
        },
      },
      {
        id: "ml",
        name: "Mobile Legends",
        image: mlImg,
        format: "points",
        rankings: [
          { rank: 1, team: "Storm", points: 210, prize: "₹2,000" },
          { rank: 2, team: "Wolves", points: 190, prize: "₹1,500" },
          { rank: 3, team: "Dragons", points: 165, prize: "₹1,000" },
        ],
      },
    ],
  },
  {
    id: "campus-cup-2024",
    title: "Campus Cup 2024",
    date: "Sep 02, 2024",
    location: "Auditorium",
    participants: 32,
    prize: "₹6,000",
    status: "past",
    image: codImg,
    games: [
      {
        id: "codm",
        name: "COD Mobile",
        image: codImg,
        format: "bracket",
        rankings: [],
        bracket: {
          columns: [
            {
              title: "Quarterfinal",
              matches: [
                { teamA: "OpTic", teamB: "100 Thieves", scoreA: 3, scoreB: 1, status: "completed", time: "Sun, Jul 27 - 10:00 AM" },
                { teamA: "Boston Breach", teamB: "Team Heretics", scoreA: 1, scoreB: 3, status: "completed", time: "Sat, Jul 26 - 7:00 PM" },
                { teamA: "Movistar KOI", teamB: "Vancouver Surge", scoreA: 1, scoreB: 3, status: "completed", time: "Sat, Jul 26 - 10:30 PM" },
              ],
            },
            {
              title: "Semifinal",
              matches: [
                { teamA: "Team Heretics", teamB: "OpTic", scoreA: 2, scoreB: 3, status: "completed", time: "Sun, Jul 27 - 9:00 PM" },
                { teamA: "Vancouver Surge", teamB: "Movistar KOI", scoreA: 3, scoreB: 2, status: "completed", time: "Sun, Jul 27 - 7:30 PM" },
              ],
            },
            {
              title: "Grand Final",
              matches: [
                { teamA: "Vancouver Surge", teamB: "OpTic", scoreA: 0, scoreB: 4, status: "completed", time: "Mon, Jul 28 - 12:05 AM" },
              ],
            },
          ],
          winner: "OpTic",
        },
      },
      {
        id: "ml",
        name: "Mobile Legends",
        image: mlImg,
        format: "points",
        rankings: [
          { rank: 1, team: "Storm", points: 210, prize: "₹2,000" },
          { rank: 2, team: "Wolves", points: 190, prize: "₹1,500" },
          { rank: 3, team: "Dragons", points: 165, prize: "₹1,000" },
        ],
      },
    ],
  },
];

export const getEventById = (id: string) => events.find((e) => e.id === id);
