"use client";
import styles from "./page.module.css";
import { Provider, useSelector } from "react-redux";
import store, { selectTracks } from "./store";
import TrackList from "./components/TrackList/TrackList";
import TrackHeaderList from "./components/TrackHeaderList/TrackHeaderList";
import { TrackInterface } from "./features/tracks/trackTypes";
import Canvas from "./components/Canvas/Canvas";
import TrackHeadersPanel from "./components/Panels/TrackHeadersPanel";
import TimelineRuler from "./components/Rulers/TimelineRuler";
import Viewport from "./components/Viewport/Viewport";
import PlaybackVolumeMeter from "./components/Meters/PlaybackVolumeMeter";
import MainToolbar from "./components/Toolbars/MainToolbar";
import ApplicationHeader from "./components/Headers/ApplicationHeader";

// Main App wrapped with Redux Provider
export default function Home() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

interface ProjectProps {
  tracks: TrackInterface[];
}

function Project({ tracks }: ProjectProps) {
  return (
    <div style={{height: "100%" }}>
      <ApplicationHeader />
      <MainToolbar/>
      <div className={styles.project}>
        <TrackHeadersPanel>
          <TrackHeaderList
            tracks={tracks}
            trackHeaderClick={(track) => console.log(`Track header ${track.id} clicked`)}
          />
        </TrackHeadersPanel>
        <Viewport>
          <Canvas>
            <TimelineRuler />
            <TrackList />
          </Canvas>
        </Viewport>
        <PlaybackVolumeMeter />
      </div>
    </div>
  );
}

// Main component that uses Redux hooks
function App() {
  const tracks = useSelector(selectTracks);

  return (
    <main className={styles.main}>
      <Project tracks={tracks} />
    </main>
  );
}
