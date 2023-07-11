import React, { useState, useEffect } from "react";
import {
  getAirdropList,
  getAirdropInfos,
  sortAirdrops,
  getPublicAirdrops,
} from "utils/getAirdropList";
import { useDefaultChainId } from "config/useDefaultChainId";

import AirdropsBase from "../../components/Airdropper/Airdrops";
import BaseLayout from "../../components/BaseLayout/BaseLayout";
import HomeLayout from "../../components/HomeLayout";
import { useDocumentTitle } from "../../hooks/setDocumentTitle";
import AirplaneSVG from "../../svgs/Sidebar/airplane";
import { useModal } from "react-simple-modal-provider";

const Tabs = [
  {
    id: 1,
    tabName: "Live",
  },
  {
    id: 2,
    tabName: "Upcoming",
  },
  {
    id: 3,
    tabName: "Ended",
  },
];

export default function Airdrops() {
  useDocumentTitle("Airdrops");

  const { open: openLoadingModal, close: closeLoadingModal } =
    useModal("LoadingModal");
  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [endedList, setEndedList] = useState([]);
  const [timedList, setTimedList] = useState([]);
  const [liveList, setLiveList] = useState([]);
  const [publicList, setPublicList] = useState([]);
  const chainId = useDefaultChainId();

  const handleFetch = async () => {
    setReady(false);
    openLoadingModal();
    try {
      const airdrops = await getAirdropList(chainId);
      const publicAirdrops = await getPublicAirdrops(chainId, airdrops.data);
      const sortedAirdrops = await sortAirdrops(chainId, airdrops.data);
      let timed = sortedAirdrops.data.timed;
      let live = sortedAirdrops.data.live;
      let ended = sortedAirdrops.data.ended;
      if (publicAirdrops.success) {
        setPublicList(publicAirdrops.data);
      }
      if (airdrops.success) {
        const infoTimed = await getAirdropInfos(chainId, timed);
        const infoLive = await getAirdropInfos(chainId, live);
        const infoEnded = await getAirdropInfos(chainId, ended);

        if (infoTimed.success) {
          setTimedList(infoTimed.data);
        }
        if (infoLive.success) {
          setLiveList(infoLive.data);
        }
        if (infoEnded.success) {
          setEndedList(infoEnded.data);
        }
      }
      closeLoadingModal();
      setReady(true);
    } catch (error) {}
  };

  useEffect(() => {
    handleFetch();
  }, []);

  return (
    <BaseLayout
      title={"Airdropper"}
      title_img={<AirplaneSVG className="md:hidden fill-dim-text" />}
      page_name={"Airdrops"}
      page_description={"Airdrop to multiple users in few clicks."}
    >
      <HomeLayout
        airdrop
        tabs={Tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      >
        {ready ? (
          <AirdropsBase
            publicList={publicList}
            timedList={timedList}
            endedList={endedList}
            liveList={liveList}
            activeTab={activeTab}
          />
        ) : (
          <></>
        )}
      </HomeLayout>
    </BaseLayout>
  );
}
