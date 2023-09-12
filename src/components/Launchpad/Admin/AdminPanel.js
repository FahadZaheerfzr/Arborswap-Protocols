import PreviewDetails from "components/Common/PreviewDetails";
import React from "react";
import { useEffect, useState } from "react";
import { Contract } from "ethers";
import { useEthers } from "@usedapp/core";
import PublicSaleAbi from "../../../config/abi/PublicSale.json";
import PublicSaleErcAbi from "../../../config/abi/PublicSaleErcAbi.json";
import PrivateSaleAbi from "../../../config/abi/PrivateSale.json";
import PrivateSaleErcAbi from "../../../config/abi/PrivateSaleErcAbi.json";
import FairLaunchAbi from "../../../config/abi/FairlaunchSale.json";
import FairLaunchErcAbi from "../../../config/abi/FairlaunchErcAbi.json";
import { BACKEND_URL } from "config/constants/LaunchpadAddress";
import axios from "axios";
import getSuccessPublic from "utils/successfulPublic";
import getIsFinished from "utils/getFinished";
import { useModal } from "react-simple-modal-provider";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PercentFilled from "../Pools/Subcomponents/PercentFilled";
import Web3 from "web3";
import getSaleInfo from "utils/getSaleInfo";
import { getLiquidityLockList, getLpLockInfos } from "utils/getLockList";
import { getLpInfo } from "utils/lpInfo";

export default function AdminPanel({
  status,
  hard_cap,
  filled_percent,
  soft_cap,
  finished,
  sale,
  objId,
  cancelled,
}) {
  const { library, chainId } = useEthers();
  const [isFinished, setIsFinished] = useState(null);
  const [saleInfo, setSaleInfo] = useState(null);
  const [lock, setLock] = useState(null);
  const [contributors, setContributors] = useState(null);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [whiteListedAddresses, setWhiteListedAddresses] = useState([""]);
  //LoadingModal
  const { open: openLoadingModal, close: closeLoadingModal } =
    useModal("LoadingModal");

  const getContributors = async () => {
    try {
      let abi;
      if (sale.saleType === "standard") {
        abi = PublicSaleAbi;
      } else if (sale.saleType === "private") {
        abi = PrivateSaleAbi;
      }
      const contract = new Contract(
        sale.saleAddress,
        abi,
        library.getSigner()
      );
      const contributors = await contract.numberOfParticipants();
      setContributors(contributors.toNumber());
    } catch (err) {
      console.log(err,"ahahahah");
    }
  };
  console.log(finished, "finished");
  const handleAddressChange = (newValue) => {
    const addressesArray = newValue.split(",");
    const updatedAddresses = addressesArray.map((address) =>
      address.trim().toLowerCase()
    );
    setWhiteListedAddresses(updatedAddresses);
  };
  console.log(whiteListedAddresses, "whiteListedAddresses");
  async function getFinished() {
    const res = await getIsFinished(sale.saleAddress).then((res) => {
      setIsFinished(res);
      console.log(res, "is Finished");
    });
  }

  console.log(sale.chainID, "finalize sale");
  async function getCurrentSaleInfo() {
    const res = await getSuccessPublic(sale.saleAddress).then((res) => {
      setSaleInfo(res);
    });
    const lockInfo = await getLpLockInfos(
      ["0x0ba8bd135A0a09410B3cc118004ec37dfB3F2592"],
      chainId
    );
    setLock(lockInfo);
  }
  console.log(lock, "lock");
  useEffect(() => {
    getContributors();
    getFinished();
    getCurrentSaleInfo();
  }, []);
  const finalizeSale = async () => {
    if (chainId !== sale.chainID) {
      toast.error("Please switch to appropriate network");
      return;
    }
    openLoadingModal();
    let contract;

    if (sale.currency.symbol === "BNB") {
      if (sale.saleType === "standard") {
        contract = new Contract(
          sale.saleAddress,
          PublicSaleAbi,
          library.getSigner()
        );
      } else if (sale.saleType === "private") {
        contract = new Contract(
          sale.saleAddress,
          PrivateSaleAbi,
          library.getSigner()
        );
      } else if (sale.saleType === "fairlaunch") {
        contract = new Contract(
          sale.saleAddress,
          FairLaunchAbi,
          library.getSigner()
        );
      }
    } else {
      if (sale.saleType === "standard") {
        contract = new Contract(
          sale.saleAddress,
          PublicSaleErcAbi,
          library.getSigner()
        );
      } else if (sale.saleType === "private") {
        contract = new Contract(
          sale.saleAddress,
          PrivateSaleErcAbi,
          library.getSigner()
        );
      } else if (sale.saleType === "fairlaunch") {
        contract = new Contract(
          sale.saleAddress,
          FairLaunchErcAbi,
          library.getSigner()
        );
      }
    }
    console.log(contract);
    try {
      const tx = await contract.finishSale();
      await tx.wait();
      try {
        const token = await getLiquidityLockList(chainId);
        console.log(token);
        if (token) {
          //put last token in token array in object
          const lockInfo = await getLpLockInfos(
            [token.data[token.data.length - 1]],
            chainId
          );
          console.log(lockInfo, "lockInfo");
          const tokenInfo = await getLpInfo(lockInfo.data[0].info.token);
          const lockObject = {
            address: token.data[token.data.length - 1],
            first: lockInfo.data[0].info[1],
            second: lockInfo.data[0].info[2],
            third: lockInfo.data[0].info[3],
            fourth: lockInfo.data[0].info[4],
            fifth: lockInfo.data[0].info[5],
            sixth: lockInfo.data[0].info[6],
            amount: lockInfo.data[0].info.amount,
            isVesting: lockInfo.data[0].info.isVesting,
            isWithdrawn: lockInfo.data[0].info.isWithdrawn,
            lockDate: lockInfo.data[0].info.lockDate,
            logoImage: lockInfo.data[0].info.logoImage,
            token: tokenInfo,
            unlockDate: lockInfo.data[0].info.unlockDate,
            owner: lockInfo.data[0].owner,
            tokenAddress: lockInfo.data[0].token,
          };

          await axios.post(`${BACKEND_URL}/api/lock`, {
            Lock: lockObject,
            liquidity: true,
            chainId: chainId,
          });
        }
      } catch (err) {
        console.log(err);
      }
      toast.success("Sale Finalized Successfully");
    } catch (err) {
      alert("Something went wrong");
      closeLoadingModal();
      console.log(err);
      return;
    }

    //update the isFinised in database
    const finalSaleObject = {
      saleId: sale.saleId,
      saleAddress: sale.saleAddress,
      saleType: sale.type,
      github: sale.github,
      website: sale.website,
      twitter: sale.twitter,
      linkedin: sale.linkedin,
      discord: sale.discord,
      telegram: sale.telegram,
      youtube: sale.youtube,
      image: sale.image,
      name: sale.name,
      description: sale.description,
      tags: sale.tags,
      token: sale.token,
      minAllocation: sale.minAllocation,
      maxAllocation: sale.maxAllocation,
      amountLiquidity: sale.amountLiquidity,
      listing: sale.listing,
      lockup: sale.lockup,
      presalePrice: sale.presalePrice,
      endDate: Math.floor(Date.now() / 1000),
      startDate: sale.startDate,
      hardCap: sale.hardCap,
      softCap: sale.softCap,
      unsoldToken: sale.unsoldToken,
      currency: sale.currency,
      dex: sale.dex,
      whiteisting: sale.whiteisting,
      whiteListedAddresses: sale.whiteListedAddresses,
      owner: sale.owner,
      isFinished: sale.isFinished,
      chainID: sale.chainID,
    }      
    try {
      const res = await axios.put(`${BACKEND_URL}/api/sale/${objId}`, {
        isFinished: "true",
        sale: finalSaleObject,
      });
      toast.success("Sale Finalized Successfully");
      // window.location.reload();
    } catch (err) {
      console.log(err);
      closeLoadingModal();
    }
    closeLoadingModal();
  };
  console.log(sale.name, "sale name");
  const cancelSale = async () => {
    if (chainId !== sale.chainID) {
      toast.error("Please switch to appropriate network");
      return;
    }
    openLoadingModal();
    let contract;

    if (sale.currency.symbol === "BNB") {
      if (sale.saleType === "standard") {
        contract = new Contract(
          sale.saleAddress,
          PublicSaleAbi,
          library.getSigner()
        );
      } else if (sale.saleType === "private") {
        contract = new Contract(
          sale.saleAddress,
          PrivateSaleAbi,
          library.getSigner()
        );
      } else if (sale.saleType === "fairlaunch") {
        contract = new Contract(
          sale.saleAddress,
          FairLaunchAbi,
          library.getSigner()
        );
      }
    } else {
      if (sale.saleType === "standard") {
        contract = new Contract(
          sale.saleAddress,
          PublicSaleErcAbi,
          library.getSigner()
        );
      } else if (sale.saleType === "private") {
        contract = new Contract(
          sale.saleAddress,
          PrivateSaleErcAbi,
          library.getSigner()
        );
      } else if (sale.saleType === "fairlaunch") {
        contract = new Contract(
          sale.saleAddress,
          FairLaunchErcAbi,
          library.getSigner()
        );
      }
    }
    console.log(contract);
    try {
      console.log(status);
      const tx = await contract.cancelSale();
      await tx.wait();
      toast.success("Sale Cancelled Successfully");
    } catch (err) {
      alert("Something went wrong");
      closeLoadingModal();
      console.log(err);
      return;
    }

    //update the isFinised in database
    try {
      const res = await axios.put(`${BACKEND_URL}/api/sale/${objId}`, {
        isCancelled: "true",
      });

      toast.success("Sale Cancelled Successfully");
      window.location.reload();
    } catch (err) {
      console.log(err);
      closeLoadingModal();
    }
    closeLoadingModal();
  };
  function handleInput() {
    setIsInputOpen(!isInputOpen);
  }
  async function handleAddAddress() {
    if (whiteListedAddresses[0] === "") {
      toast.error("Please enter atleast one address");
      return;
    }
    openLoadingModal();

    try {
      const contract = new Contract(
        sale.saleAddress,
        PublicSaleAbi,
        library.getSigner()
      );

      const tx = await contract.setMultiplyAddressesWL(
        whiteListedAddresses.map((address) => address),
        true
      );
      await tx.wait();
      try {
        //an array with new addresses added after sale.whiteListedAddresses
        const updatedAddresses = [
          ...sale.whiteListedAddresses,
          ...whiteListedAddresses,
        ];
        const finalSaleObject = {
          saleId: sale.saleId,
          saleAddress: sale.saleAddress,
          saleType: sale.type,
          github: sale.github,
          website: sale.website,
          twitter: sale.twitter,
          linkedin: sale.linkedin,
          discord: sale.discord,
          telegram: sale.telegram,
          youtube: sale.youtube,
          image: sale.image,
          name: sale.name,
          description: sale.description,
          tags: sale.tags,
          token: sale.token,
          minAllocation: sale.minAllocation,
          maxAllocation: sale.maxAllocation,
          amountLiquidity: sale.amountLiquidity,
          listing: sale.listing,
          lockup: sale.lockup,
          presalePrice: sale.presalePrice,
          endDate: sale.endDate,
          startDate: sale.startDate,
          hardCap: sale.hardCap,
          softCap: sale.softCap,
          unsoldToken: sale.unsoldToken,
          currency: sale.currency,
          dex: sale.dex,
          whiteisting: sale.whiteisting,
          whiteListedAddresses: updatedAddresses,
          owner: sale.owner,
          isFinished: sale.isFinished,
        };
        const res = await axios.put(`${BACKEND_URL}/api/sale/${objId}`, {
          sale: finalSaleObject,
        });
        toast.success("Address Added Successfully");
        closeLoadingModal();
        // window.location.reload();
      } catch (err) {
        console.log(err);
        closeLoadingModal();
        toast.error("Something went wrong");
      }
    } catch (err) {
      console.log(err);
      closeLoadingModal();
      toast.error("Something went wrong");
    }
  }

  return (
    <>
      <div className="hidden md:block px-9 pb-9 bg-white dark:bg-dark-1 rounded-[20px]">
        <div className="w-full flex justify-center">
          <div className="w-1/2 py-5 flex justify-center items-center border-b-2 border-primary-green ">
            <span className="font-bold text-primary-green">Admin Panel</span>
          </div>
        </div>

        <div className="w-full flex justify-between mt-7">
          <span className="text-gray dark:text-gray-dark text-sm font-medium">
            Soft/Hard Cap
          </span>

          {status !== "Upcoming" ? (
            <div className="bg-primary-green bg-opacity-[0.08] px-3 py-[0.5px] rounded-[10px] border-[0.5px] border-dashed border-primary-green">
              <span className="rounded-[10px] text-primary-green">
                {status}
              </span>
            </div>
          ) : (
            <div className="bg-[#C89211] bg-opacity-[0.08] px-3 py-[0.5px] rounded-[10px] border-[0.5px] border-dashed border-[#C89211]">
              <span className="rounded-[10px] text-[#C89211]">Upcoming</span>
            </div>
          )}
        </div>

        <div className="w-full flex mt-3">
          <span className="font-bold text-dark-text dark:text-light-text text-2xl">
            {soft_cap} - {hard_cap} {sale.currency.symbol}
          </span>
        </div>

        {status !== "Upcoming" && (
          <div className="mt-7">
            <div className="flex items-center justify-between">
              {hard_cap && filled_percent && (
                <span className="text-xs  text-gray dark:text-gray-dark">
                  {(hard_cap * (filled_percent / 100)).toLocaleString()}{" "}
                  {sale.currency.symbol}
                </span>
              )}

              <span className="text-xs  text-dim-text dark:text-dim-text-dark">
                {hard_cap} {sale.currency.symbol}
              </span>
            </div>

            <PercentFilled
              sale = {sale}
              address={sale.saleAddress}
              isFinished={finished}
              isCancelled={cancelled}
              saleType={sale.saleType}
            />
          </div>
        )}
        {sale.whiteisting !== false &&
          sale.whiteListedAddresses.map((address, index) => {
            return (
              <div className="mt-7" key={index}>
                <PreviewDetails
                  name={"Whitelisted Address"}
                  value={address}
                  enable_copy={true}
                  address={true}
                  setFunction={handleInput}
                  isInputOpen={isInputOpen}
                />
              </div>
            );
          })}

        {isInputOpen && (
          <div className="mt-7 flex">
            <input
              type="text"
              value={whiteListedAddresses}
              onChange={(e) => handleAddressChange(e.target.value)}
              className="px-3 py-2 rounded-md border dark:border-white border-black text-sm w-full mr-2 dark:text-white text-black"
              placeholder="0xaEa5..."
            />
            <button
              className=" bg-primary-green text-white px-3 py-2 rounded-md focus:outline-none "
              onClick={handleAddAddress}
            >
              Add
            </button>
          </div>
        )}

        {status !== "Upcoming" && contributors != null && (
          <div className="mt-7">
            <PreviewDetails name={"Contributors"} value={contributors} />
          </div>
        )}
        {saleInfo === false && !finished && status !== "Live" && !cancelled && (
          <div className="mt-7">
            <button
              onClick={() => {
                finalizeSale();
              }}
              className={`w-full ${
                status === "Upcoming"
                  ? "bg-light dark:bg-dark text-dark-text dark:text-light-text"
                  : "bg-primary-green text-white"
              } rounded-md font-bold py-4`}
              disabled={status === "Upcoming" ? true : false}
            >
              {/* if sale is not finished then show manage adress too */}
              {status === "Upcoming" ? "Manage Address" : "Finalize Sale"}
            </button>
          </div>
        )}
        {saleInfo === false && !cancelled && (
          <div className="mt-7">
            <button
              onClick={() => {
                cancelSale();
              }}
              className={`w-full ${
                status === "Upcoming"
                  ? "bg-light dark:bg-dark text-dark-text dark:text-light-text"
                  : "dark:bg-dark text-white"
              } rounded-md font-bold py-4`}
            >
              Cancel Sale
            </button>
          </div>
        )}
        {cancelled && (
          <span className="text-sm font-medium text-gray dark:text-gray-dark">
            sale was cancelled{" "}
          </span>
        )}
      </div>
    </>
  );
}
