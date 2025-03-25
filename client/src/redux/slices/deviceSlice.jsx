import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

export const fetchDevices = createAsyncThunk(
  'devices/fetchDevices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/devices');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addDevice = createAsyncThunk(
  'devices/addDevice',
  async (deviceData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/devices', deviceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const deviceSlice = createSlice({
  name: 'devices',
  initialState: {
    devices: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDevices.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.loading = false;
        state.devices = action.payload;
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addDevice.fulfilled, (state, action) => {
        state.devices.push(action.payload);
      });
  }
});

export default deviceSlice.reducer;