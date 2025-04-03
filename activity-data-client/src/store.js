import  { configureStore } from '@reduxjs/toolkit';
import authReducer from "./slices/authSlice"
import uploadReducer from "./slices/uploadSlice"
import activityReducer from "./slices/activitySlice"
import predictionReducer from "./slices/predictionSlice"

export const store = configureStore({
    reducer: {
/* movies:movieReducer */
auth: authReducer,
upload: uploadReducer,
activity: activityReducer,
predictions: predictionReducer


    }
})