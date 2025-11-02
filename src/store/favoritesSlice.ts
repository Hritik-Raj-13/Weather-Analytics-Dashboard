import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FavoriteCity {
  id: string;
  city_name: string;
  country_code: string;
  latitude: number;
  longitude: number;
}

interface FavoritesState {
  cities: FavoriteCity[];
  loading: boolean;
}

const initialState: FavoritesState = {
  cities: [],
  loading: false,
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    setFavorites: (state, action: PayloadAction<FavoriteCity[]>) => {
      state.cities = action.payload;
    },
    addFavorite: (state, action: PayloadAction<FavoriteCity>) => {
      state.cities.push(action.payload);
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.cities = state.cities.filter(city => city.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setFavorites, addFavorite, removeFavorite, setLoading } = favoritesSlice.actions;
export default favoritesSlice.reducer;
