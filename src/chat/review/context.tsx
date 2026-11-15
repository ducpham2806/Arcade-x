// Staging-only context bridge; never imported by the launcher.
import {createContext,useContext} from 'react';
export const ReviewContext=createContext<any>(null);
export const usePlayer=()=>useContext(ReviewContext).player;
export const useGameSession=()=>useContext(ReviewContext).session;
export const useLauncherUi=()=>useContext(ReviewContext).ui;
