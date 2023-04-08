import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { rootState } from "./";

export interface TileMeta {
  id: number;
  position: [number, number];
  value: number;
}

export interface TileState {
  tiles: {
    [key: number]: TileMeta;
  };
  byIds: number[];
  hasChanged: boolean;
  inMotion: boolean;
  score: number;
}

export interface UiState {
  tileState: TileState;
  tileCount: number;
  maxGeneratedValue: number;
  history: TileState[];
  initial: boolean;
}

const initialTileState: TileState = {
  tiles: {},
  byIds: [],
  hasChanged: false,
  inMotion: false,
  score: 0,
}

const initialState: UiState = {
  tileState: initialTileState,
  tileCount: 4,
  maxGeneratedValue: 4,
  history: [],
  initial: true,
}

export const uiSlice = createSlice({
  name: "ui",
  initialState: initialState,
  reducers: {
    changeTileCount: (state: UiState, action: PayloadAction<number>) => {
      state.tileCount = action.payload;

      state.tileState = initialTileState;
      state.history = [];
      state.initial = true;
    },
    changeMaxGeneratedValue: (state: UiState, action: PayloadAction<number>) => {
      state.maxGeneratedValue = action.payload;

      state.tileState = initialTileState;
      state.history = [];
      state.initial = true;
    },
    createTile: (state: UiState, action: PayloadAction<TileMeta>) => {
      state.tileState.tiles[action.payload.id] = action.payload;
      state.tileState.byIds.push(action.payload.id);
      state.tileState.hasChanged = false;
      state.history.push(state.tileState);
    },
    updateTile: (state: UiState, action: PayloadAction<TileMeta>) => {
      state.tileState.tiles[action.payload.id] = action.payload;
      state.tileState.hasChanged = true;
    },
    mergeTile: (state: UiState, action: PayloadAction<{ source: TileMeta, destination: TileMeta }>) => {
      const { source, destination } = action.payload;
      const { [source.id]: sourceTile, [destination.id]: destinationTile, ...restTiles } = state.tileState.tiles;
      state.tileState.tiles = {
        ...restTiles,
        [destination.id]: {
          id: destination.id,
          value: source.value + destination.value,
          position: destination.position,
        },
      };
      state.tileState.byIds = state.tileState.byIds.filter(id => id !== source.id);
      state.tileState.score += source.value;
    },
    startMove: (state: UiState) => {
      state.tileState.inMotion = true;
    },
    endMove: (state: UiState) => {
      state.tileState.inMotion = false;
    },
    undo: (state: UiState) => {
      if (state.history.length > 1) {
        state.history.pop();
        state.tileState = state.history[state.history.length - 1];
      }
    },
    changeInitial: (state: UiState, action: PayloadAction<boolean>) => {
      state.initial = action.payload;
    },
    reset: (state: UiState) => {
      state.tileState = initialTileState;
      state.history = [];
      state.initial = true;
    }
  }
});

export const selectTileCount = (state: rootState) => state.ui.tileCount;
export const selectMaxGeneratedValue = (state: rootState) => state.ui.maxGeneratedValue;
export const selectTiles = (state: rootState) => state.ui.tileState.tiles;
export const selectByIds = (state: rootState) => state.ui.tileState.byIds;
export const selectHasChanged = (state: rootState) => state.ui.tileState.hasChanged;
export const selectInMotion = (state: rootState) => state.ui.tileState.inMotion;
export const selectInitial = (state: rootState) => state.ui.initial;
export const selectScore = (state: rootState) => state.ui.tileState.score;
