import React, { useState, useEffect } from "react";
import BackArrowSVG from "../../../svgs/back_arrow";
import PreviewHeader from "../../Common/PreviewHeader";
import HeadingTags from "../../TokenLocker/Subcomponents/HeadingTags";
import CalendarField from "./Subcomponents/CalendarField";
import CurrencyOptions from "./Subcomponents/CurrencyOption";
import DexOptions from "./Subcomponents/DexOption";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";

import Input from "./Subcomponents/Input";
import PresaleStandard from "./Subcomponents/PresaleStandard";
import PresalePrivate from "./Subcomponents/PresalePrivate";
import { useModal } from "react-simple-modal-provider";
import { ethers } from "ethers";
import { useEthers } from "@usedapp/core";
import { Contract } from "ethers";
import ERCAbi from "../../../config/abi/ERC20.json";
import { approveTokens } from "utils/deploySale";
import {
  BSC_PUBLIC_FACTORYADDRESS,
  FairLaunchErc_FACTORYADRESS,
  FairLaunch_FACTORYADRESS,
  PrivateErc_FACTORYADRESS,
  Private_FACTORYADRESS,
  PublicErc_FACTORYADRESS,
  Public_FACTORYADRESS,
  USDT_ADDRESS,
  RBA_ADDRESS,
  USDC_ADDRESS,
  USDT_ADDRESS_BSC,
  USDC_ADDRESS_BSC,
  RBA_ADDRESS_BSC,
} from "config/constants/LaunchpadAddress";

const currencies1 = [
  {
    id: 1,
    name: "Binance",
    symbol: "BNB",
    icon: "/images/cards/bnb.svg",
    address: "",
  },
  {
    id: 2,
    name: "Roburna",
    symbol: "RBA",
    icon: "/images/cards/arb.svg",
    address: RBA_ADDRESS,
  },
  {
    id: 3,
    name: "USD Coin",
    symbol: "USDC",
    icon: "/images/cards/gusd.svg",
    address: USDC_ADDRESS,
  },
  {
    id: 4,
    name: "Tether",
    symbol: "USDT",
    icon: "/images/cards/usdt.svg",
    address: USDT_ADDRESS,
  },
];
const currencies2 = [
  {
    id: 1,
    name: "Binance",
    symbol: "BNB",
    icon: "/images/cards/bnb.svg",
    address: "",
  },
  {
    id: 2,
    name: "Roburna",
    symbol: "RBA",
    icon: "/images/cards/arb.svg",
    address: RBA_ADDRESS_BSC,
  },
  {
    id: 3,
    name: "USD Coin",
    symbol: "USDC",
    icon: "/images/cards/gusd.svg",
    address: USDC_ADDRESS_BSC,
  },
  {
    id: 4,
    name: "Tether",
    symbol: "USDT",
    icon: "/images/cards/usdt.svg",
    address: USDT_ADDRESS_BSC,
  },
];

const dexes = [
  {
    name: "Arborswap",
    icon: "/images/cards/arb.svg",
  },
  {
    name: "Pancakeswap",
    icon: "/images/cards/pancake.svg",
  },
];

export default function Presale({ setActive, saleType, setSaleObject, token }) {
  const { chainId } = useEthers();
  const [currencySelected, setCurrencySelected] = useState(1);
  const [currencies, setCurrencies] = useState(currencies1);
  const [tempfixed, setTempFixed] = useState(true);
  const [dex, setDex] = useState(2);
  const [presalePrice, setPresalePrice] = useState();
  const [softCap, setSoftCap] = useState();
  const [hardCap, setHardCap] = useState();
  const [minAllocation, setMinAllocation] = useState();
  const [maxAllocation, setMaxAllocation] = useState();
  const [whiteisting, setWhiteisting] = useState(false);
  const [listing, setListing] = useState();
  const [amountLiquidity, setAmountLiquidity] = useState();
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [firstRelease, setFirstRelease] = useState();
  const [vestingPeriod, setVestingPeriod] = useState();
  const [vestingRelease, setVestingRelease] = useState();
  const [unsoldToken, setUnsoldTokens] = useState("Burn");
  const [requiredToken, setRequiredToken] = useState("0");
  const [connected, setConnected] = useState(false);
  const [lockup, setLockup] = useState();
  const { account, library } = useEthers();
  const [enoughBalance, setEnoughBalance] = useState(false);
  const [whiteListedAddresses, setWhiteListedAddresses] = useState([""]);
  const [percent1, setPercent1] = useState(0);
  const [percent2, setPercent2] = useState(0);
  const [percent3, setPercent3] = useState(0);
  const [percent4, setPercent4] = useState(0);

  const { open: openLoadingModal, close: closeLoadingModal } =
    useModal("LoadingModal");
  const { open: openModal } = useModal("ConnectionModal");
  console.log(connected);

  useEffect(() => {
    if (chainId === 56) {
      setCurrencies(currencies2);
    } else {
      setCurrencies(currencies1);
    }
  }, [chainId]);

  const handleAddressChange = (newValue) => {
    const addressesArray = newValue.split(',');
    const updatedAddresses = addressesArray.map((address) => address.trim().toLowerCase());
    setWhiteListedAddresses(updatedAddresses);
  };

  // const handleDateChange = (newDate, index) => {
  //   const updatedDates = [...whiteListedDates];
  //   updatedDates[index] = newDate;
  //   setWhiteListedDates(updatedDates);
  // };

  const handleSubmit = async () => {
    //if start date is less than current date and time, and also if end date is less than start date
    const now = moment();
    console.log(account);
    if (account === undefined) {
      toast.error("Please connect your wallet");
    }
    if (startDate < now.unix()) {
      toast.error("Start date should be greater than current date and time");
      return;
    }
    if (endDate < startDate) {
      toast.error("End date should be greater than start date");
      return;
    }
    //white list first index should be after start date and before end date
    // if (whiteisting) {
    //   if (whiteListedDates[0] < startDate) {
    //     toast.error(
    //       "Whitelist date should be greater than start date and time",
    //       {
    //         position: toast.POSITION.BOTTOM_RIGHT,
    //       }
    //     );
    //     return;
    //   }
    //   if (whiteListedDates[0] > endDate) {
    //     toast.error("Whitelist date should be less than end date and time");
    //     return;
    //   }
    // }
    // //second round should be after first round and before end date
    // if (whiteisting && whiteListedDates.length > 1) {
    //   if (whiteListedDates[1] < whiteListedDates[0]) {
    //     toast.error(
    //       "Whitelist date should be greater than first whitelist date and time",
    //       {
    //         position: toast.POSITION.BOTTOM_RIGHT,
    //       }
    //     );
    //     return;
    //   }
    //   if (whiteListedDates[1] > endDate) {
    //     toast.error("Whitelist date should be less than end date and time");
    //     return;
    //   }
    // }
    //third round should be after second round and before end date
    // if (whiteisting && whiteListedDates.length > 2) {
    //   if (whiteListedDates[2] < whiteListedDates[1]) {
    //     toast.error(
    //       "Whitelist date should be greater than second whitelist date and time",
    //       {
    //         position: toast.POSITION.BOTTOM_RIGHT,
    //       }
    //     );
    //     return;
    //   }
    //   if (whiteListedDates[2] > endDate) {
    //     toast.error("Whitelist date should be less than end date and time");
    //     return;
    //   }
    // }
    //white listing addresses shouldnt be empty
    if (whiteisting) {
      if (whiteListedAddresses[0] === "") {
        toast.error("Whitelist address can't be empty");
        return;
      }
    }
    let total = parseFloat(percent1)+parseFloat(percent2)+parseFloat(percent3)+parseFloat(percent4);
    if(saleType==="private"&&total!==100){
      toast.error("Percentages should add up to 100");
      return;
    }
    //if white list then set white list dates and addresses else error
    // if (whiteisting) {
    //   if (whiteListedAddresses.length > whiteListedDates.length) {
    //     toast.error("Please fill all the fields");
    //     return;
    //   }
    // }
    if (!enoughBalance) {
      toast.error("Insufficient Balance!");
      return;
    }
    if (saleType==="standard"&&(amountLiquidity < 51 || amountLiquidity === undefined)) {
      toast.error("Liquidity should be greater than 50%");
      return;
    }
    //listing cant be less than presale rate
    if (parseFloat(listing) > parseFloat(presalePrice)) {
      toast.error("Listing rate can't be more than presale rate");
      return;
    }

    let res = false;
    openLoadingModal();
    if (saleType === "standard") {
      if (
        lockup === undefined ||
        maxAllocation === undefined ||
        minAllocation === undefined ||
        hardCap === undefined ||
        softCap === undefined ||
        presalePrice === undefined ||
        endDate === undefined ||
        startDate === undefined ||
        amountLiquidity === undefined ||
        listing === undefined
      ) {
        toast.error("Please fill all the fields");
        closeLoadingModal()
        return;
      }
      if (currencySelected === 1) {
        if (chainId === 56) {
          res = await approveTokens(library, token, BSC_PUBLIC_FACTORYADDRESS);
        } else {
          res = await approveTokens(library, token, Public_FACTORYADRESS);
        }
      } else {
        res = await approveTokens(library, token, PublicErc_FACTORYADRESS);
      }
    } else if (saleType === "private") {
      if (currencySelected === 1) {
        res = await approveTokens(library, token, Private_FACTORYADRESS);
      } else {
        res = await approveTokens(library, token, PrivateErc_FACTORYADRESS);
      }
    } else if (saleType === "fairlaunch") {
      if (currencySelected === 1) {
        res = await approveTokens(library, token, FairLaunch_FACTORYADRESS);
      } else {
        res = await approveTokens(library, token, FairLaunchErc_FACTORYADRESS);
      }
    }

    if (!res) {
      closeLoadingModal();
      return;
    }
    const presaleObject = {
      currency: currencies[currencySelected - 1],
      dex: dexes[dex - 1],
      presalePrice: presalePrice,
      softCap: softCap,
      hardCap: hardCap,
      minAllocation: minAllocation,
      maxAllocation: maxAllocation,
      whiteisting: whiteisting,
      listing: listing,
      vestingPeriod: vestingPeriod,
      vestingRelease: vestingRelease,
      firstRelease: firstRelease,
      amountLiquidity: amountLiquidity,
      startDate: startDate,
      endDate: endDate,
      unsoldToken: unsoldToken,
      lockup: lockup,
      owner: account,
      isFinished: false,
      whiteListedAddresses: whiteListedAddresses,
      percent1: percent1,
      percent2: percent2,
      percent3: percent3,
      percent4: percent4,
    };

    setSaleObject(presaleObject);
    closeLoadingModal();
    setActive("Project Details");
  };

  const handleCheckBalance = async () => {
    const contract = new Contract(
      token.tokenAddress,
      ERCAbi,
      library.getSigner(account)
    );
    const amountRequired = ethers.utils.parseUnits(
      requiredToken.toString(),
      ethers.BigNumber.from(token.tokenDecimals)
    );
    try {
      const balance = await contract.balanceOf(account);

      if (balance.gte(amountRequired)) {
        return true;
      }
      return false;
    } catch (error) {
      console.log(error)
      return false;
    }
  };

  useEffect(() => {
    if (!account) {
      setConnected(false);
      openModal();
    } else {
      setConnected(true);
    }
  }, [account]);

  //use effect in which we will set required token if hardcap, softcap, listing price, amount liquidity, presale price changes
  useEffect(() => {
    if (hardCap > 0 && presalePrice > 0 && listing > 0 && saleType === "standard") {
      const reqTokens = hardCap * presalePrice;
      const reqTokens2 = (listing * (amountLiquidity / 100)) * hardCap;
      console.log(reqTokens, reqTokens2);
      setRequiredToken((reqTokens + reqTokens2).toFixed(2));
    }
    if (saleType === "private") {
      setRequiredToken(0);
    }
    //for fairlaunch
    if (saleType === "fairlaunch") {
      setRequiredToken(0);
    }
  }, [hardCap, softCap, listing, presalePrice]);

  // //for fairlaunch
  // useEffect(() => {
  //
  //     if (presalePrice > 0 && softCap > 0 && amountLiquidity > 0 && saleType === "fairlaunch") {
  //       const totalSupply = ethers.utils.parseUnits(presalePrice.toString(), token.tokenDecimals.toString());
  //
  //       const liquidityAmount = ethers.utils.parseUnits(amountLiquidity.toString(), 18);
  //
  //       const requiredToken = totalSupply.mul(liquidityAmount).div(ethers.utils.parseUnits("1", "18"));

  //       setRequiredToken(requiredToken.toString());
  //
  //       // consolelog if user has enough balance
  //       // wait till return true from handleCheckBalance
  //       // if true then set required token
  //     }
  //   }, [presalePrice, softCap, amountLiquidity]);

  useEffect(() => {
    console.log("use effect");
    checkBalance();
  }, [requiredToken, account, connected]);

  // //for private sale
  // useEffect(() => {
  //
  //     if (hardCap > 0 && softCap > 0 && presalePrice > 0) {
  //       const hardCapBNB = ethers.utils.parseUnits(hardCap.toString(), 18);
  //       const totalSupply = ethers.utils.parseUnits(presalePrice.toString(), token.tokenDecimals.toString());
  //       const presaleRateBNB = hardCapBNB.div(totalSupply);

  //       setRequiredToken(hardCapBNB.toString());
  //
  //       // consolelog if user has enough balance
  //       // wait till return true from handleCheckBalance
  //       // if true then set required token
  //     }
  //   }, [hardCap, softCap, presalePrice]);

  async function checkBalance() {
    console.log("check balance");
    const check = await handleCheckBalance();

    if (check) {
      setEnoughBalance(true);
    } else {
      setEnoughBalance(false);
    }
  }

  const handleTempFixed = () => {
    setWhiteisting(!whiteisting);
    setTempFixed(!tempfixed);
  };
  return (
    <>
      <div className="w-full">
        {/* sticky navbar */}
        <HeadingTags name={"Choose Currency"} required />

        {/* Currency Options */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mt-4">
          {currencies.map((currency) => (
            <CurrencyOptions
              key={currency.id}
              selected={currency.id === currencySelected}
              setCurrency={setCurrencySelected}
              {...currency}
            />
          ))}
        </div>

        <PreviewHeader heading={"Presale Details"} />

        {(saleType === "standard"||saleType === "private" ) && (
          <>
            <Input
              heading={"Presale Price"}
              currencies={currencies}
              currencySelected={currencySelected}
              changeState={setPresalePrice}
            />
          </>
        )}
        {saleType === "fairlaunch" && (
          <Input
            heading={"Amount to be sold"}
            text={token.symbol}
            changeState={setPresalePrice}
          />
        )}
        <div className="flex items-center gap-5 mt-10">
          <div className="w-full">
            <Input
              heading={"Soft Cap"}
              currencies={currencies}
              currencySelected={currencySelected}
              changeState={setSoftCap}
            />
          </div>
          <div className="w-full">
            <Input
              heading={"Hard Cap"}
              currencies={currencies}
              currencySelected={currencySelected}
              changeState={setHardCap}
            />
          </div>
        </div>

        <div className="flex items-center gap-5 mt-10">
          <div className="w-full">
            <Input
              heading={"Min Allocation"}
              currencies={currencies}
              currencySelected={currencySelected}
              changeState={setMinAllocation}
            />
          </div>

          <div className="w-full">
            <Input
              heading={"Max Allocation"}
              currencies={currencies}
              currencySelected={currencySelected}
              changeState={setMaxAllocation}
              tooltip={
                "The maximum allocation for a token refers to the maximum amount of that token that can be assigned or allocated."
              }
            />
          </div>
        </div>

        {saleType !== "fairlaunch" && (
          <div>
            <div className="flex items-center justify-between mt-10">
              <span className="text-gray dark:text-gray-dark font-semibold">
                Enable Whitelisting
              </span>

              <label
                htmlFor="whitelist-toggle"
                className="inline-flex relative items-center cursor-pointer"
              >
                <input
                  type="checkbox"
                  value=""
                  checked={tempfixed ? false : true}
                  id="whitelist-toggle"
                  className="sr-only peer"
                  onChange={handleTempFixed}
                />
                <div className="w-10 h-5 md:w-10 md:h-5 bg-primary-green bg-opacity-[0.08] peer-focus:outline-none peer-focus:ring-0 peer-focus:ring-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:md:top-[2px] after:left-[0] after:md:left-[4px] after:bg-white after:rounded-full after:h-4 after:md:h-4 after:w-4 after:md:w-4 after:transition-all  peer-checked:after:bg-primary-green" />
              </label>
            </div>

            <div className="mt-5">
              <span className="text-gray dark:text-gray-dark font-semibold text-sm">
                Note
                <span className="font-medium">
                  &nbsp;: When turned on only users that are whitelisted will be
                  able to participate in the presale.
                </span>
              </span>
            </div>
          </div>
        )}
        {/* here if whitelisting is enabled, show an input field where addresses can be entered, seperated by comma */}
        {whiteisting && (
          <>
            <div className="mt-5" >
              <Input
                heading={`Whitelisted Address`}
                changeState={(newValue) =>
                  handleAddressChange(newValue)
                }
                whitelist={true}
                tooltip="Enter addresses to whitelist them for the presale"
                placeholder="0xaEa574007c8ad33c7f4f7CF4a0d0B6F704ACD59e,..."
                nothing={true}
              />
              {/* <div className="mt-2">
                  <CalendarField
                    heading={`Whitelist start date (UTC) for Address ${
                      index + 1
                    }`}
                    setFunction={handleDateChange}
                    index={index}
                  />
                </div> */}
            </div>
          </>
        )}

        {saleType !== "private" && (
          <div>
            <PreviewHeader heading={"Listing Details"} />
            <div className="mt-10">
              <HeadingTags name={"Choose DEX to be listed on"} required />
            </div>

            <div className="flex items-center gap-5 mt-10 ">
              <DexOptions
                selected={dex === 1}
                id={1}
                setDex={setDex}
                name={"Arborswap"}
                icon={"/images/cards/arb.svg"}
              />
              <DexOptions
                selected={dex === 2}
                id={2}
                setDex={setDex}
                name={"Pancake"}
                icon={"/images/cards/pancake.svg"}
              />
            </div>

            <div className="flex items-center gap-5 mt-10">
              <div className="w-full">
                <div className="hidden md:block">
                  <Input
                    heading={"% for Liquidity"}
                    changeState={setAmountLiquidity}
                    tooltip={
                      "Ready availability of assets for seamless and hassle-free decentralized financial transactions and activities."
                    }
                  />
                </div>
                <div className="md:hidden">
                  <Input
                    heading={"Liquidity"}
                    changeState={setAmountLiquidity}
                  />
                </div>
              </div>
              {saleType !== "fairlaunch" && (
                <div className="w-full">
                  <Input
                    heading={"Listing Price"}
                    currencies={currencies}
                    currencySelected={currencySelected}
                    changeState={setListing}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <PreviewHeader heading={"Time Details"} />

        <div className="flex flex-col md:flex-row items-center gap-5 mt-10">
          <div className="w-full md:w-1/2">
            <CalendarField
              heading={"Starts On (UTC)"}
              setFunction={setStartDate}
            />
          </div>
          <div className="w-full md:w-1/2">
            <CalendarField heading={"Ends On (UTC)"} setFunction={setEndDate} />
          </div>
        </div>
        {saleType !== "private" && (
          <div>
            <PreviewHeader heading={"More Details"} />
            <PresaleStandard
              unsoldToken={unsoldToken}
              setUnsoldTokens={setUnsoldTokens}
              setLockup={setLockup}
            />
          </div>
        )}

        {saleType === "private" && (
          <div>
            <PreviewHeader heading={"Token Vesting Details"} />
            <PresalePrivate
              setFirstRelease={setFirstRelease}
              setVestingPeriod={setVestingPeriod}
              setVestingRelease={setVestingRelease}
            />
            <PreviewHeader heading={"Vesting Portions"} />
            <div className="mt-10">
              <Input 
                heading={"Vesting Portion 1"}
                changeState={setPercent1}
                tooltip={"Enter the percentage of tokens to be released in the first vesting period"}
                placeholder={"0"}
                nothing={true}
              />
              < Input
                heading={"Vesting Portion 2"}
                changeState={setPercent2}
                tooltip={"Enter the percentage of tokens to be released in the second vesting period"}
                placeholder={"0"}
                nothing={true}
              />
              <Input
                heading={"Vesting Portion 3"}
                changeState={setPercent3}
                tooltip={"Enter the percentage of tokens to be released in the third vesting period"}
                placeholder={"0"}
                nothing={true}
              />
              <Input
                heading={"Vesting Portion 4"}
                changeState={setPercent4}
                tooltip={"Enter the percentage of tokens to be released in the fourth vesting period"}
                placeholder={"0"}
                nothing={true}
              />
            </div>

          </div>
        )}
        {saleType === "standard" && (
          <div className="flex justify-center mt-7 bg-[#E56060] bg-opacity-[0.08] py-3 rounded-[10px]">
            <img src="/images/create-sale/warning.svg" alt="warning" />
            <span className="text-[#E56060] font-medium text-sm">
              To Create this Sale{" "}
              <span className="font-bold">
                {requiredToken} {token.name}
              </span>{" "}
              is required.
            </span>
          </div>
        )}

        <div className="mt-10">
          <div className="flex justify-end items-center mb-10">
            <button
              className="bg-white dark:bg-transparent mr-5 flex items-center gap-2 py-[10px] px-5"
              onClick={() => setActive("Token Info")}
            >
              <BackArrowSVG className="fill-dark-text dark:fill-light-text" />
              <span className="font-gilroy font-medium text-sm text-dark-text dark:text-light-text">
                Go Back
              </span>
            </button>

            <button
              className="bg-primary-green hover:opacity-40 disabled:bg-light-text text-white font-gilroy font-bold px-8 py-3 rounded-md"
              // disabled={address.length < 5}
              onClick={handleSubmit}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
