import React from "react";
import ModalField from "./ModalField";
import { useEffect, useState } from "react";
import { BigNumber, Contract, ethers } from "ethers";
import { useEtherBalance, useEthers } from "@usedapp/core";
import PublicSaleAbi from "../../../config/abi/PublicSale.json";
import PublicSaleErcAbi from "../../../config/abi/PublicSaleErcAbi.json";
import PrivateSaleAbi from "../../../config/abi/PrivateSale.json";
import PrivateSaleErcAbi from "../../../config/abi/PrivateSaleErcAbi.json";
import FairLaunchAbi from "../../../config/abi/FairlaunchSale.json";
import FairLaunchErcAbi from "../../../config/abi/FairlaunchErcAbi.json";
import { formatEther, parseEther } from "ethers/lib/utils";
import { API_URL, API_KEY } from "config/constants/api";
import axios from "axios";
import getSaleInfo from "utils/getSaleInfo";
import usePublicErcSaleInfo from "utils/getPublicErcSaleInfo";
import usePrivateSaleInfo from "utils/getPrivateSaleInfo";
import usePrivateErcSaleInfo from "utils/getPrivateErcSaleInfo";
import useFairlaunchSaleInfo from "utils/getFairLaunchSaleInfo";
import useFairlaunchErcSaleInfo from "utils/getFairLaunchErcSaleInfo";
import { formatBigToNum } from "utils/numberFormat";
import ERC20 from "config/abi/ERC20.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import getAmountParticipated from "utils/getAmountParticipated";
import Web3 from "web3";
import { useModal } from "react-simple-modal-provider";
import { BACKEND_URL } from "config/constants/LaunchpadAddress";

export default function Modal({
  showModal,
  from_symbol,
  from_icon,
  to_icon,
  to_symbol,
  sale,
  objId,
  // account,
}) {
  const { library } = useEthers();
  const [amount, setAmount] = useState(0);
  const [bnbUSD, setBnbUSD] = useState(317);
  const [usdAmount, setUsdAmount] = useState(sale.minAllocation * bnbUSD);
  const [tokenPrice, setTokenPrice] = useState(parseFloat(sale.presalePrice));
  const { open: openLoadingModal, close: closeLoadingModal } =
    useModal("LoadingModal");
  // const sale_info_public_erc = usePublicErcSaleInfo(sale.saleAddress);
  console.log(sale, "saleis");
  let account = "";
  const [balanceBNB, setBalanceBNB] = useState(null);
  const [balance, setBalance] = useState(0);
  const [acct, setAcct] = useState("");
  let bought = "";

  useEffect(() => {
    async function connectWallet() {
      if (typeof window.ethereum !== "undefined") {
        // Instance web3 with the provided information
        const web3 = new Web3(window.ethereum);
        try {
          // Request account access
          await window.ethereum.enable();
          // Wallet connected successfully
          // You can perform further actions here
          account = await web3.eth.getAccounts();
          setAcct(account[0]);
          web3.eth.getBalance(account[0]).then((res) => {
            setBalanceBNB(res);
          });
        } catch (e) {
          // User denied access or error occurred
          // Handle the error or show appropriate message
        }
      }
    }

    connectWallet();
  }, []);

  const [tokenAmount, setTokenAmount] = useState(0);

  // useEffect(() => {
  //   const result = getSaleInfo(sale.saleAddress).then((res) => {
  //     setSaleInfoPublic(res);
  //   });
  // }, []);

  useEffect(() => {
    console.log("currenct address", sale.currency.address);
    console.log(acct, "acct");
    if (sale.currency.symbol !== "BNB") {
      console.log(sale.currency.address, "sale.currency.address");
      const contract = new Contract(
        sale.currency.address,
        ERC20,
        library.getSigner()
      );
      const getBalance = async () => {
        try {
          if (!acct) return;
          const balance = await contract.balanceOf(acct);
          const balanceString = formatBigToNum(balance, 18);
          setBalance(parseFloat(balanceString.replace(/,/g, "")));
        } catch (e) {
          console.log(e);
        }
      };
      getBalance();
    } else {
      if (!balanceBNB) return;
      setBalance(formatEther(balanceBNB).substring(0, 6));
    }
  }, [balanceBNB, acct]);

  // async function getPrice() {
  //   if (!saleInfoPublic) return;
  //   const res = await saleInfoPublic.totalBNBRaised;
  //   setPriceInBNB(res);
  // }
  // useEffect(() => {
  //   getPrice();
  // }, [saleInfoPublic]);

  // useEffect(() => {
  //   if (priceInBNB === null) return;
  //   if (
  //     saleInfoPublic
  //     // sale_info_public_erc &&
  //     // sale_info_private &&
  //     // sale_info_private_erc &&
  //     // sale_info_fairlaunch &&
  //     // sale_info_fairlaunch_erc
  //   ) {
  //     if (sale.currency.symbol === "BNB") {
  //       if (sale.saleType === "standard") {
  //         console.log(priceInBNB)
  //         const price = formatBigToNum(priceInBNB?.toString(), 18, 4);
  //         setTokenPrice(price);
  //       }
  //       // else if (sale.saleType === "private") {
  //       //   console.log("sale_info_private", sale_info_private)
  //       //   const price = formatBigToNum(
  //       //     sale_info_private.tokenPriceInBNB.toString(),
  //       //     18,
  //       //     4
  //       //   );
  //       //   setTokenPrice(price);
  //       // }
  //       // else if (sale.saleType === "fairlaunch") {
  //       //   const price = formatBigToNum(
  //       //     sale_info_fairlaunch.tokenPriceInBNB.toString(),
  //       //     18,
  //       //     4
  //       //   );
  //       //   setTokenPrice(price);
  //       // }
  //     } else {
  //       if (sale.saleType === "standard") {
  //         // console.log(
  //         //   "sale_info_public_erc",
  //         //   sale_info_public_erc.tokenPriceInERC20
  //         // );
  //         // const price = formatBigToNum(
  //         //   sale_info_public_erc.tokenPriceInERC20.toString(),
  //         //   18,
  //         //   4
  //         // );
  //         // setTokenPrice(price);
  //         toast.error("Please buy with BNB");
  //       }
  //       // else if (sale.saleType === "private") {
  //       //   const price = formatBigToNum(
  //       //     sale_info_private_erc.tokenPriceInERC20.toString(),
  //       //     18,
  //       //     4
  //       //   );
  //       //   setTokenPrice(price);
  //       // }
  //       // else if (sale.saleType === "fairlaunch") {
  //       //   const price = formatBigToNum(
  //       //     sale_info_fairlaunch_erc.tokenPriceInERC20.toString(),
  //       //     18,
  //       //     4
  //       //   );
  //       //   setTokenPrice(price);
  //       // }
  //     }
  //   }
  // }, [priceInBNB, saleInfoPublic]);

  const convertBNBtoUSD = async () => {
    try {
      const res = await axios.get(`${API_URL}`, {
        headers: {
          Accepts: "application/json",
          "X-CMC_PRO_API_KEY": API_KEY,
        },
        params: { slug: "bnb", convert: "USD" },
      });

      //console.log("res",res)
    } catch {
      setBnbUSD(317);
    }
  };

  useEffect(() => {
    convertBNBtoUSD();
  }, []);

  //get user balanceBNB
  const handleSubmit = async () => {
    //user balanceBNB
    //check if sale started
    bought = await getAmountParticipated(sale.saleAddress, acct, sale.saleType);
    console.log("bought", bought);
    const userAllocation = formatBigToNum(bought[0].toString(), 19, 4);

    if (userAllocation >= sale.maxAllocation) {
      console.log(
        "userAllocation",
        userAllocation,
        "sale.maxAllocation",
        sale.maxAllocation
      );
      toast.error("You have reached the maximum allocation");
      return;
    }
    // console.log(sale)
    const start = new Date(sale.startDate);
    const now = new Date();
    // console.log("start", start, "now", now);
    if (now < start) {
      toast.error("Sale not started yet");
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      toast.error("Insufficient balance");
      return;
    }
    const saleContractAddress = sale.saleAddress;

    let abi;
    if (sale.currency.symbol === "BNB") {
      if (sale.saleType === "standard") {
        abi = PublicSaleAbi;
      } else if (sale.saleType === "private") {
        abi = PrivateSaleAbi;
      } else {
        abi = FairLaunchAbi;
      }
    } else {
      if (sale.saleType === "standard") {
        abi = PublicSaleErcAbi;
      } else if (sale.saleType === "private") {
        abi = PrivateSaleErcAbi;
      } else {
        abi = FairLaunchErcAbi;
      }
    }

    const contract = new Contract(
      saleContractAddress,
      abi,
      library.getSigner()
    );
    // console.log("contract", contract);
    const amountBuy = parseEther(amount.toString()).toString();
    openLoadingModal();
    try {
      if (sale.currency.symbol !== "BNB") {
        const approvalContract = new Contract(
          sale.currency.address,
          ERC20,
          library.getSigner()
        );
        try {
          const approval = await approvalContract.approve(
            sale.saleAddress,
            ethers.constants.MaxUint256
          );
          await approval.wait();
        } catch (err) {
          console.log(err);
        }
      }

      if (sale.currency.symbol === "BNB") {
        const tx = await contract.participate({
          value: amountBuy,
        });
        await tx.wait();
      } else {
        console.log("acct", acct, amountBuy);
        const tx = await contract.participate(amountBuy);
        await tx.wait();
      }
      try {
        const saleInfo = await getSaleInfo(
          sale.saleAddress,
          sale.type,
          sale.currency.symbol
        );
        let res;
        if (sale.saleType === "standard" || sale.currency.symbol === "BNB") {
          res = await saleInfo.totalBNBRaised;
        } else if (sale.saleType === "private") {
          res = await saleInfo.totalERC20Raised;
        }
        res = BigNumber.from(res);
        const percents = res.mul(100).div(saleInfo.hardCap);
        const filled = formatBigToNum(percents.toString(), 0, 1);
        console.log(res, "in get price");
        console.log(filled, "filled");
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
          whiteListedAddresses: sale.whiteListedAddresses,
          owner: sale.owner,
          isFinished: sale.isFinished,
          filledPercent: filled,
          chainID: sale.chainID,
        };
        console.log(finalSaleObject, "finalSaleObject");
        const res2 = await axios.put(`${BACKEND_URL}/api/sale/${objId}`, {
          sale: finalSaleObject,
        });
        console.log(res2, "res2");
      } catch (err) {
        console.log(err);
      }
      // closeLoadingModal();
      toast.success("Transaction successful");
      // window.history.back();
      showModal(false);
    } catch (err) {
      toast.error("Transaction failed");
      console.log(err);
    }
    closeLoadingModal();
  };

  const handleInput = async (e) => {
    setAmount(Number(e.target.value));
    setUsdAmount((Number(e.target.value) * bnbUSD).toFixed(3));
    setTokenAmount((Number(e.target.value) * tokenPrice).toFixed(5));
  };

  const handleMax = () => {
    //balanceBNB to number everything after , is not removed
    if (balanceBNB === null) {
      toast.error("Connect wallet first");
      return;
    }
    //if balance is less than max allocation show error
    console.log(parseFloat(balance), parseFloat(sale.maxAllocation));
    if (parseFloat(balance) < parseFloat(sale.maxAllocation)) {
      toast.error("Insufficient balance");
      return;
    }
    let bal = balance;
    const amt = parseFloat(sale.maxAllocation);
    setAmount(amt);
    console.log(amt);
    setUsdAmount((amt * bnbUSD).toFixed(3));
    console.log(amt * tokenPrice);
    setTokenAmount((amt * tokenPrice).toFixed(5));
  };
  const handleHalf = () => {
    if (balanceBNB === null) {
      toast.error("Connect wallet first");
      return;
    }
    //if balance is less than max allocation show error

    if (parseFloat(balance) < parseFloat(sale.maxAllocation) / 2) {
      toast.error("Insufficient balance");
      return;
    }
    let bal = balance;
    const amt = parseFloat(sale.maxAllocation);
    setAmount(amt / 2);
    setUsdAmount(((amt / 2) * bnbUSD).toFixed(3));
    setTokenAmount(((amt / 2) * tokenPrice).toFixed(5));
  };

  return (
    <>
      <div
        className={`w-screen h-screen flex backdrop-blur-[7px] flex-col justify-center items-center bg-[#F2F3F5] dark:bg-dark dark:bg-opacity-40 bg-opacity-40`}
      >
        <div className="w-[90%] max-w-[420px] rounded-[10px] px-9 py-5 bg-white dark:bg-dark-1">
          <div className="flex justify-between items-center  ">
            <span className="text-dark-text dark:text-light-text font-gilroy font-semibold text-lg">
              Join Pool
            </span>

            <div
              className="flex items-center cursor-pointer"
              onClick={() => showModal(false)}
            >
              <span className="text-sm font-gilroy font-semibold text-dark-text dark:text-light-text mr-2">
                Close
              </span>
              <div className="flex justify-center items-center bg-[#E56060] text-[#E56060] bg-opacity-10 rounded-full w-[15px] h-[15px]">
                &#10005;
              </div>
            </div>
          </div>
          <div className="mt-[30px]">
            <ModalField text={"From"} icon={from_icon} currency={from_symbol} />
          </div>

          <div className="mt-7">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm text-gray dark:text-gray-dark">
                Amount
              </span>

              <span className="font-medium text-sm text-dim-text dark:text-dim-text-dark">
                Balance:
                <span className="text-dark-text dark:text-light-text">
                  {balance && balance.toLocaleString()}
                </span>
              </span>
            </div>
          </div>
          <div className="mt-[10px] flex justify-between items-center rounded-md bg-[#F5F1EB] dark:bg-dark-3 px-5 py-5">
            <div className="flex flex-col">
              <input
                className="bg-transparent outline-none text-sm font-medium text-dark-text dark:text-light-text"
                type="number"
                placeholder="0.0"
                onChange={handleInput}
                value={amount}
                step={0.001}
                max={sale.maxAllocation}
                min={sale.minAllocation}
              />

              <span className="mt-3 text-sm font-medium text-gray dark:text-gray-dark">
                ~ ${usdAmount}
              </span>
            </div>

            <div className="border-l border-dashed pl-5 border-dim-text dark:border-dim-text-dark ">
              <button
                onClick={handleHalf}
                className="rounded-sm bg-[#C29D46] bg-opacity-[0.08] py-[2px] px-4 text-[#C89211] text-sm onhover:cursor-pointer"
              >
                Half
              </button>

              <div
                onClick={handleMax}
                className="mt-3 rounded-sm bg-primary-green bg-opacity-[0.08] py-[2px] px-4 text-primary-green text-sm"
              >
                Max
              </div>
            </div>
          </div>

          <div className="flex justify-center my-7">
            <img src="/images/arrows/arrow_down_green.svg" alt="arrow down" />
          </div>

          <div className="mt-4">
            <ModalField
              text={"You'll get"}
              icon={to_icon}
              currency={to_symbol}
            />
          </div>

          <div className="mt-7">
            <span className="font-semibold text-sm text-gray dark:text-gray-dark">
              Amount
            </span>
          </div>

          <div className="mt-[10px]  rounded-md bg-[#F5F1EB] dark:bg-dark-3 px-5 py-5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xl text-dark-text dark:text-light-text">
                {parseFloat(tokenAmount)}
              </span>
              <span className="text-sm font-medium text-gray dark:text-gray-dark">
                ~ $---
              </span>
            </div>
          </div>
        </div>

        <div className="w-[90%] max-w-[420px]  mt-1">
          <button
            className="w-full bg-primary-green text-white py-5 rounded-md font-gilroy font-bold text-xl"
            onClick={handleSubmit}
          >
            Buy
          </button>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
