import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  movieList: [{ id: "1", name: "ANything" },
    { id: "2", name: "Another thing" }
  ],
};
const movieSlice = createSlice({
  name: "movies",
  initialState,
  reducers: {
    addMovie: (state, action) => {
      state.movies.push(action.payload);
    },
    removeMovie: (state, action) => {
      state.movies.pop(action.payload);
    },
  },
});

export const { addMovie, removeMovie } = movieSlice.actions;
export default movieSlice.reducer;
