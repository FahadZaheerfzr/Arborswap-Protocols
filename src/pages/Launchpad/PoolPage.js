import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BaseLayout from "../../components/BaseLayout/BaseLayout";
import PoolPageBase from "../../components/Launchpad/PoolPage";
import { useEthers } from "@usedapp/core";
import Modal from "components/Launchpad/Modal";
import axios from "axios";
import { useModal } from "react-simple-modal-provider";
import { BACKEND_URL } from "config/constants/LaunchpadAddress";
import Web3 from "web3";

export default function PoolPage() {
  const { id } = useParams();
  const { account } = useEthers();
  const [pool, setPool] = useState(null);
  const [modal, showModal] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [userAccount, setUserAccount] = useState(null);
  const [saleOwner, setSaleOwner] = useState(null);
  const { open: openLoadingModal, close: closeLoadingModal } =
    useModal("LoadingModal");


  useEffect(() => {
  async function getAccount() {
    const web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.enable();
      const res = await web3.eth.getAccounts();
      setUserAccount(res[0]);
      if (res[0] === saleOwner) {
        setAdmin(true);
        setAdminMode(true);
      }
      else {
        setAdmin(false);
        setAdminMode(false);
      }
    } catch (e) {
      console.log(e);
    }
  }
  getAccount();
  }, [saleOwner,account]);

  useEffect(() => {
    //get pool data from api
    openLoadingModal();
    axios
      .get(`${BACKEND_URL}/api/sale/${id}`)
      .then((res) => {
        setPool(res.data);
        document.title = res.data.sale.name;
        // Check if the user is admin
        setSaleOwner(res.data.sale.owner);        
        closeLoadingModal();
      })
      .catch((err) => {
        console.log(err);
        //alert ("Something went wrong")
        closeLoadingModal();
      });
  }, []);
  return (
    pool && (
      <div className="w-full">
        {modal && (
          <div className="fixed z-50  top-0 left-0">
            <Modal
              showModal={showModal}
              from_symbol={pool.sale.currency.symbol}
              from_icon={pool.sale.currency.icon}
              to_icon={pool.sale.token.image}
              to_symbol={pool.sale.token.tokenSymbol}
              token={pool.sale.token}
              sale={pool.sale}
              objId={pool._id}
              account={userAccount}
            />
          </div>
        )}
        <BaseLayout
          page_name={"Pools"}
          title={pool.sale.name}
          subpage
          admin={admin}
          setAdminMode={setAdminMode}
        >
          <PoolPageBase
            objId={pool._id}
            pool={pool.sale}
            visible={pool.visible}
            showModal={showModal}
            admin={adminMode}
            isFinished={pool.isFinished}
            isCancelled={pool.isCancelled}
          />
        </BaseLayout>
      </div>
    )
  );
}
