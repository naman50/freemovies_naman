import type { MediaItem } from "@/types/media";

export const mockTrending: MediaItem[] = [
  {
    id: 550,
    tmdbId: 550,
    imdbId: "tt0137523",
    mediaType: "movie",
    title: "Fight Club",
    overview: "An office worker and a soap maker form an underground club that spirals into something much larger.",
    posterPath: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    backdropPath: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
    voteAverage: 8.4,
    releaseDate: "1999-10-15",
    genreIds: [18]
  },
  {
    id: 1399,
    tmdbId: 1399,
    mediaType: "tv",
    title: "Game of Thrones",
    overview: "Noble families wage war while an ancient enemy rises beyond the wall.",
    posterPath: "/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    backdropPath: "/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg",
    voteAverage: 8.5,
    firstAirDate: "2011-04-17",
    genreIds: [18, 10765]
  },
  {
    id: 157336,
    tmdbId: 157336,
    imdbId: "tt0816692",
    mediaType: "movie",
    title: "Interstellar",
    overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    posterPath: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdropPath: "/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
    voteAverage: 8.5,
    releaseDate: "2014-11-05",
    genreIds: [12, 18, 878]
  }
];

export const mockTv: MediaItem[] = [
  {
    id: 66732,
    tmdbId: 66732,
    mediaType: "tv",
    title: "Stranger Things",
    overview: "When a young boy vanishes, a small town uncovers secret experiments and a supernatural mystery.",
    posterPath: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    backdropPath: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    voteAverage: 8.6,
    firstAirDate: "2016-07-15",
    genreIds: [18, 9648, 10765]
  },
  {
    id: 60574,
    tmdbId: 60574,
    mediaType: "tv",
    title: "Peaky Blinders",
    overview: "A gangster family epic set in Birmingham after the First World War.",
    posterPath: "/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg",
    backdropPath: "/bGksau9GGu0uJ8DJQ8DYc9JW5LM.jpg",
    voteAverage: 8.5,
    firstAirDate: "2013-09-12",
    genreIds: [18, 80]
  }
];

export const genreMap = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 18, name: "Drama" },
  { id: 80, name: "Crime" },
  { id: 878, name: "Sci-Fi" },
  { id: 9648, name: "Mystery" },
  { id: 10765, name: "Sci-Fi & Fantasy" }
];
