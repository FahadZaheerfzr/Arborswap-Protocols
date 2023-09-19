import { Contract } from "@ethersproject/contracts";
import PublicAbi from "../config/abi/PublicLaunchpadAbi.json";
import PrivateAbi from "../config/abi/PrivateLaunchpadAbi.json";
import FairAbi from "../config/abi/FairLaunchpadAbi.json";
import PublicErcAbi from "../config/abi/PublicLaunchErcAbi.json";
import PrivateErcAbi from "../config/abi/PrivateLaunchErcAbi.json";
import FairErcAbi from "../config/abi/FairErcAbi.json";
import PublicSaleAbi from "../config/abi/PublicSale.json";
import {
  Public_FACTORYADRESS,
  BSC_PUBLIC_FACTORYADDRESS,
  ROUTER_ADDRESS,
  BSC_ROUTER_ADDRESS,
  ADMIN_ADDRESS,
  Private_FACTORYADRESS,
  FairLaunch_FACTORYADRESS,
  USDT_ADDRESS,
  USDC_ADDRESS,
  RBA_ADDRESS,
  PublicErc_FACTORYADRESS,
  PrivateErc_FACTORYADRESS,
  FairLaunchErc_FACTORYADRESS,
  BSC_PUBLIC_ERC_FACTORYADDRESS,
  USDT_ADDRESS_BSC,
  USDC_ADDRESS_BSC,
  RBA_ADDRESS_BSC,
} from "config/constants/LaunchpadAddress";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers, utils } from "ethers";
import ERCAbi from "../config/abi/ERC20.json";
import { useDefaultChainId } from "config/useDefaultChainId";

export const approveTokens = async (library, token, factoryContractAddress) => {
  const contract = new Contract(
    token.tokenAddress,
    ERCAbi,
    library.getSigner()
  );

  const amount = ethers.constants.MaxUint256;

  try {
    const approval = await contract.approve(factoryContractAddress, amount);

    await approval.wait();
  } catch (error) {
    return false;
  }
  return true;
};

// Public sale
/* formating break to find functions easily


*/

export const deployPublicSaleMainnet = async (
  token,
  saleObject,
  library,
  account,
  deploymentFee,
  saleData,
  chainId,
  closeLoadingModal
) => {
  if (chainId !== 56) {
    alert("Please switch to BSC Mainnet");
    return;
  }
  const contract = new Contract(
    BSC_PUBLIC_FACTORYADDRESS,
    PublicAbi,
    library.getSigner()
  );

  console.log(chainId, "chainId");

  const saleId = await contract.getNumberOfSalesDeployed();
  const routerAddress = BSC_ROUTER_ADDRESS;

  console.log(routerAddress, "routerAddress");
  const adminAddress = ADMIN_ADDRESS;
  // 2nd - with uints [minParticipation, maxParticipation, lp%, dex listing rate,lpLockPeriod, saleEnd, saleStart, hardCap(tokens), softCap(bnb)]
  let deployedAddress;
  let finalSaleObject;
  //console
  console.log((
    [routerAddress, adminAddress, token.tokenAddress, account],
    [
      parseEther(saleObject.minAllocation.toString()).toString(),
      parseEther(saleObject.maxAllocation.toString()).toString(),
      (saleObject.amountLiquidity * 100).toString(),
      parseUnits(
        saleObject.listing.toString(),
        token.tokenDecimals
      ).toString(),
      (saleObject.lockup * 86400).toString(),
      parseUnits(
        saleObject.presalePrice.toString(),
        token.tokenDecimals
      ).toString(),
      saleObject.endDate,
      saleObject.startDate,
      parseEther(saleObject.hardCap.toString()).toString(),
      parseEther(saleObject.softCap.toString()).toString(),
    ],
    saleObject.unsoldToken === "Burn" ? true : false,
    {
      value: utils.parseEther(deploymentFee.toString()),
    }
  ));
  try {
    const tx = await contract.deployNormalSale(
      [routerAddress, adminAddress, token.tokenAddress, account],
      [
        parseEther(saleObject.minAllocation.toString()).toString(),
        parseEther(saleObject.maxAllocation.toString()).toString(),
        (saleObject.amountLiquidity * 100).toString(),
        parseUnits(
          saleObject.listing.toString(),
          token.tokenDecimals
        ).toString(),
        (saleObject.lockup * 86400).toString(),
        parseUnits(
          saleObject.presalePrice.toString(),
          token.tokenDecimals
        ).toString(),
        saleObject.endDate,
        saleObject.startDate,
        parseEther(saleObject.hardCap.toString()).toString(),
        parseEther(saleObject.softCap.toString()).toString(),
      ],
      saleObject.unsoldToken === "Burn" ? true : false,
      {
        value: utils.parseEther(deploymentFee.toString()),
        gasLimit: 5000000,
      }
    );
    await tx.wait();

    deployedAddress = await contract.saleIdToAddress(saleId.toNumber());

    finalSaleObject = {
      saleId: saleId.toNumber(),
      saleAddress: deployedAddress,
      saleType: saleData.type,
      github: saleData.github,
      website: saleData.website,
      twitter: saleData.twitter,
      whitelistEndDate: saleObject.whitelistEndDate,
      chainID: chainId,
      linkedin: saleData.linkedin,
      discord: saleData.discord,
      telegram: saleData.telegram,
      youtube: saleData.youtube,
      image: saleData.image,
      name: saleData.name,
      description: saleData.description,
      tags: saleData.tags,
      token: token,
      minAllocation: saleObject.minAllocation,
      maxAllocation: saleObject.maxAllocation,
      amountLiquidity: saleObject.amountLiquidity,
      listing: saleObject.listing,
      lockup: saleObject.lockup,
      presalePrice: saleObject.presalePrice,
      endDate: saleObject.endDate,
      startDate: saleObject.startDate,
      hardCap: saleObject.hardCap,
      softCap: saleObject.softCap,
      unsoldToken: saleObject.unsoldToken,
      currency: saleObject.currency,
      dex: saleObject.dex,
      whiteisting: saleObject.whiteisting,
      whiteListedAddresses: saleObject.whiteListedAddresses,
      // whiteListedEndDates: saleObject.whiteListedEndDates,
      owner: account,
      isFinished: false,
    };
    if (saleObject.whiteisting) {
      try {
        const contract = new Contract(
          deployedAddress,
          PublicSaleAbi,
          library.getSigner()
        );

        const ts = await contract.setWLEnabled(true);
        await ts.wait();

        const tx = await contract.setMultiplyAddressesWL(
          saleObject.whiteListedAddresses?.map((address) => address),
          true
        );
        await tx.wait();
        alert("Whitelisting Done");
        return finalSaleObject;
      } catch (error) {
        console.log(error);
        alert("Whitelisting Failed");
        closeLoadingModal();
      }
    } else return finalSaleObject;
  } catch (error) {
    console.log(error);
    closeLoadingModal();
    alert("Transaction Failed");
  }
};
export const deployPublicSaleTestnet = async (
  token,
  saleObject,
  library,
  account,
  deploymentFee,
  saleData,
  chainId,
  closeLoadingModal
) => {
  if (chainId !== 97) {
    alert("Please connect to BSC Testnet");
    return;
  }
  const contract = new Contract(
    Public_FACTORYADRESS,
    PublicAbi,
    library.getSigner()
  );
  console.log(contract)
  console.log(chainId, "chainId");

  const saleId = await contract.getNumberOfSalesDeployed();

  const routerAddress = ROUTER_ADDRESS;
  console.log(saleObject)
  console.log(saleData)
  console.log(routerAddress, "routerAddress");
  const adminAddress = ADMIN_ADDRESS;
  // 2nd - with uints [minParticipation, maxParticipation, lp%, dex listing rate,lpLockPeriod, saleEnd, saleStart, hardCap(tokens), softCap(bnb)]
  let deployedAddress;
  let finalSaleObject;
  //console
  console.log((
    [routerAddress, adminAddress, token.tokenAddress, account]
  ),"first array");
  console.log((
    [
      parseEther(saleObject.minAllocation.toString()).toString(),
      parseEther(saleObject.maxAllocation.toString()).toString(),
      (saleObject.amountLiquidity * 100).toString(),
      parseUnits(
        saleObject.listing.toString(),
        token.tokenDecimals
      ).toString(),
      (saleObject.lockup * 86400).toString(),
      parseUnits(
        saleObject.presalePrice.toString(),
        token.tokenDecimals
      ).toString(),
      saleObject.endDate,
      saleObject.startDate,
      parseEther(saleObject.hardCap.toString()).toString(),
      parseEther(saleObject.softCap.toString()).toString(),
    ]
  ),"second array");
  console.log((
    saleObject.unsoldToken === "Burn" ? true : false
  ),"third array");
  console.log((
    {
      value: utils.parseEther(deploymentFee.toString()),
      gasLimit: 5000000,
    }
  ),"fourth array");
  try {
    const tx = await contract.deployNormalSale(
      [routerAddress, adminAddress, token.tokenAddress, account],
      [
        parseEther(saleObject.minAllocation.toString()).toString(),
        parseEther(saleObject.maxAllocation.toString()).toString(),
        (saleObject.amountLiquidity * 100).toString(),
        parseUnits(
          saleObject.listing.toString(),
          token.tokenDecimals
        ).toString(),
        (saleObject.lockup * 86400).toString(),
        parseUnits(
          saleObject.presalePrice.toString(),
          token.tokenDecimals
        ).toString(),
        saleObject.endDate,
        saleObject.startDate,
        parseEther(saleObject.hardCap.toString()).toString(),
        parseEther(saleObject.softCap.toString()).toString(),
      ],
      saleObject.unsoldToken === "Burn" ? true : false,
      {
        value: utils.parseEther(deploymentFee.toString()),
        gasLimit: 5000000,
      }
    );
    await tx.wait();

    deployedAddress = await contract.saleIdToAddress(saleId.toNumber());
    finalSaleObject = {
      saleId: saleId.toNumber(),
      saleAddress: deployedAddress,
      saleType: saleData.type,
      github: saleData.github,
      website: saleData.website,
      twitter: saleData.twitter,
      chainID: chainId,
      linkedin: saleData.linkedin,
      discord: saleData.discord,
      telegram: saleData.telegram,
      whitelistEndDate: saleObject.whitelistEndDate,
      youtube: saleData.youtube,
      image: saleData.image,
      name: saleData.name,
      description: saleData.description,
      tags: saleData.tags,
      token: token,
      minAllocation: saleObject.minAllocation,
      maxAllocation: saleObject.maxAllocation,
      amountLiquidity: saleObject.amountLiquidity,
      listing: saleObject.listing,
      lockup: saleObject.lockup,
      presalePrice: saleObject.presalePrice,
      endDate: saleObject.endDate,
      startDate: saleObject.startDate,
      hardCap: saleObject.hardCap,
      softCap: saleObject.softCap,
      unsoldToken: saleObject.unsoldToken,
      currency: saleObject.currency,
      dex: saleObject.dex,
      whiteisting: saleObject.whiteisting,
      whiteListedAddresses: saleObject.whiteListedAddresses,
      // whiteListedEndDates: saleObject.whiteListedEndDates,
      owner: account,
      isFinished: false,
    };
    if (saleObject.whiteisting) {
      try {
        const contract = new Contract(
          deployedAddress,
          PublicSaleAbi,
          library.getSigner()
        );

        const ts = await contract.setWLEnabled(true);
        await ts.wait();

        const tx = await contract.setMultiplyAddressesWL(
          saleObject.whiteListedAddresses?.map((address) => address),
          true
        );
        await tx.wait();
        alert("Whitelisting Done");
        return finalSaleObject;
      } catch (error) {
        console.log(error);
        alert("Whitelisting Failed");
        closeLoadingModal();
      }
    } else return finalSaleObject;
  } catch (error) {
    console.log(error);
    closeLoadingModal();
    alert("Transaction Failed");
  }
};

// Public ERC
/* formating break to find functions easily


*/

export const deployPublicSaleERCTestnet = async (
  token,
  saleObject,
  library,
  account,
  deploymentFee,
  saleData,
  chainId,
  closeLoadingModal
) => {
  if (chainId !== 97) {
    alert("Please connect to BSC Testnet");
    return;
  }
  const contract = new Contract(
    PublicErc_FACTORYADRESS,
    PublicErcAbi,
    library.getSigner()
  );

  const saleId = await contract.getNumberOfSalesDeployed();

  const routerAddress = ROUTER_ADDRESS;
  const adminAddress = ADMIN_ADDRESS;
  let PaymentToken = "";
  if (saleObject.currency.name === "Tether") {
    PaymentToken = USDT_ADDRESS;
  } else if (saleObject.currency.name === "USD Coin") {
    PaymentToken = USDC_ADDRESS;
  } else if (saleObject.currency.name === "Roburna") {
    PaymentToken = RBA_ADDRESS;
  }

  // 2nd - with uints [minParticipation, maxParticipation, lp%, dex listing rate,lpLockPeriod, saleEnd, saleStart, hardCap(tokens), softCap(bnb)]
  console.log(PaymentToken, "PaymentToken");
  console.log(saleObject, "saleObject");
  try {
    const tx = await contract.deployERC20Sale(
      [routerAddress, adminAddress, token.tokenAddress, account, PaymentToken],
      [
        parseEther(saleObject.minAllocation.toString()).toString(),
        parseEther(saleObject.maxAllocation.toString()).toString(),
        (saleObject.amountLiquidity * 100).toString(),
        parseUnits(
          saleObject.listing.toString(),
          token.tokenDecimals
        ).toString(),
        (saleObject.lockup * 86400).toString(),
        parseUnits(
          saleObject.presalePrice.toString(),
          token.tokenDecimals
        ).toString(),
        saleObject.endDate,
        saleObject.startDate,
        parseEther(saleObject.hardCap.toString()).toString(),
        parseEther(saleObject.softCap.toString()).toString(),
      ],
      saleObject.unsoldToken === "Burn" ? true : false,
      {
        value: utils.parseEther(deploymentFee),
        gasLimit: 5000000,
      }
    );
    await tx.wait();

    const deployedAddress = await contract.saleIdToAddress(saleId.toNumber());

    const finalSaleObject = {
      saleId: saleId.toNumber(),
      saleAddress: deployedAddress,
      saleType: saleData.type,
      github: saleData.github,
      chainID: chainId,
      website: saleData.website,
      twitter: saleData.twitter,
      linkedin: saleData.linkedin,
      discord: saleData.discord,
      whitelistEndDate: saleObject.whitelistEndDate,
      telegram: saleData.telegram,
      youtube: saleData.youtube,
      image: saleData.image,
      name: saleData.name,
      description: saleData.description,
      tags: saleData.tags,
      token: token,
      minAllocation: saleObject.minAllocation,
      maxAllocation: saleObject.maxAllocation,
      amountLiquidity: saleObject.amountLiquidity,
      listing: saleObject.listing,
      lockup: saleObject.lockup,
      presalePrice: saleObject.presalePrice,
      endDate: saleObject.endDate,
      startDate: saleObject.startDate,
      hardCap: saleObject.hardCap,
      softCap: saleObject.softCap,
      unsoldToken: saleObject.unsoldToken,
      currency: saleObject.currency,
      dex: saleObject.dex,
      whiteisting: saleObject.whiteisting,
      owner: account,
      isFinished: false,
    };

    return finalSaleObject;
  } catch (error) {
    console.log(error);
    alert("Transaction Failed");
    if (closeLoadingModal) {
      closeLoadingModal();
    }
  }
};



export const deployPublicSaleERCMainnet = async (
  token,
  saleObject,
  library,
  account,
  deploymentFee,
  saleData,
  chainId,
  closeLoadingModal
) => {
  console.log(chainId, "chainId")
  if (chainId !== 56) {
    alert("Please connect to BSC Mainnet");
    return;
  }
  console.log("this is public erc mainnet, chainId", chainId)
  const contract = new Contract(
    BSC_PUBLIC_ERC_FACTORYADDRESS,
    PublicErcAbi,
    library.getSigner()
  );

  const saleId = await contract.getNumberOfSalesDeployed();

  const routerAddress = BSC_ROUTER_ADDRESS;
  const adminAddress = ADMIN_ADDRESS;
  let PaymentToken = "";

  if (saleObject.currency.name === "Tether") {
    PaymentToken = USDT_ADDRESS_BSC;
  } else if (saleObject.currency.name === "USD Coin") {
    PaymentToken = USDC_ADDRESS_BSC;
  } else if (saleObject.currency.name === "Roburna") {
    PaymentToken = RBA_ADDRESS_BSC;
  }

  // 2nd - with uints [minParticipation, maxParticipation, lp%, dex listing rate,lpLockPeriod, saleEnd, saleStart, hardCap(tokens), softCap(bnb)]
  console.log(PaymentToken, "PaymentToken");
  console.log(saleObject, "saleObject");
  try {
    const tx = await contract.deployERC20Sale(
      [routerAddress, adminAddress, token.tokenAddress, account, PaymentToken],
      [
        parseEther(saleObject.minAllocation.toString()).toString(),
        parseEther(saleObject.maxAllocation.toString()).toString(),
        (saleObject.amountLiquidity * 100).toString(),
        parseUnits(
          saleObject.listing.toString(),
          token.tokenDecimals
        ).toString(),
        (saleObject.lockup * 86400).toString(),
        parseUnits(
          saleObject.presalePrice.toString(),
          token.tokenDecimals
        ).toString(),
        saleObject.endDate,
        saleObject.startDate,
        parseEther(saleObject.hardCap.toString()).toString(),
        parseEther(saleObject.softCap.toString()).toString(),
      ],
      saleObject.unsoldToken === "Burn" ? true : false,
      {
        value: utils.parseEther(deploymentFee),
        gasLimit: 5000000,
      }
    );
    await tx.wait();

    const deployedAddress = await contract.saleIdToAddress(saleId.toNumber());

    const finalSaleObject = {
      saleId: saleId.toNumber(),
      saleAddress: deployedAddress,
      saleType: saleData.type,
      github: saleData.github,
      chainID: chainId,
      website: saleData.website,
      twitter: saleData.twitter,
      linkedin: saleData.linkedin,
      discord: saleData.discord,
      telegram: saleData.telegram,
      youtube: saleData.youtube,
      image: saleData.image,
      name: saleData.name,
      description: saleData.description,
      tags: saleData.tags,
      token: token,
      minAllocation: saleObject.minAllocation,
      maxAllocation: saleObject.maxAllocation,
      amountLiquidity: saleObject.amountLiquidity,
      whitelistEndDate: saleObject.whitelistEndDate,
      listing: saleObject.listing,
      lockup: saleObject.lockup,
      presalePrice: saleObject.presalePrice,
      endDate: saleObject.endDate,
      startDate: saleObject.startDate,
      hardCap: saleObject.hardCap,
      softCap: saleObject.softCap,
      unsoldToken: saleObject.unsoldToken,
      currency: saleObject.currency,
      dex: saleObject.dex,
      whiteisting: saleObject.whiteisting,
      owner: account,
      isFinished: false,
    };

    return finalSaleObject;
  } catch (error) {
    console.log(error);
    alert("Transaction Failed");
    if (closeLoadingModal) {
      closeLoadingModal();
    }
  }
};

// PRIVATE SALE
/* formating break to find functions easily


*/

export const deployPrivateSale = async (
  token,
  saleObject,
  library,
  account,
  deploymentFee,
  saleData,
  chainId,
  closeLoadingModal
) => {
  if(chainId!==97){
    alert("Please connect to BSC Testnet");
    return;
  }
  const contract = new Contract(
    Private_FACTORYADRESS,
    PrivateAbi,
    library.getSigner()
  );
  const adminAddress = ADMIN_ADDRESS;

  const saleId = await contract.getNumberOfSalesDeployed();
    console.log(saleObject)
  try {
    const tx = await contract.deployNormalPrivateSale(
      [adminAddress,token.tokenAddress, account],
      [
        parseEther(Number(saleObject.minAllocation).toString()).toString(),
        parseEther(Number(saleObject.maxAllocation).toString()).toString(),
        parseUnits(
          saleObject.presalePrice.toString(),
          token.tokenDecimals
        ).toString(),
        saleObject.endDate,
        saleObject.startDate,
        parseEther(Number(saleObject.hardCap).toString()).toString(),
        parseEther(Number(saleObject.softCap).toString()).toString(),
        100,
      ],
      [saleObject.endDate*60, saleObject.endDate*90, saleObject.endDate*120, saleObject.endDate*150],
      [
        parseFloat(saleObject.percent1),
        parseFloat(saleObject.percent2),
        parseFloat(saleObject.percent3),
        parseFloat(saleObject.percent4),
      ],
      { value: utils.parseEther(deploymentFee) }
    );
    await tx.wait();

    const deployedAddress = await contract.saleIdToAddress(saleId.toNumber());

    const finalSaleObject = {
      saleId: saleId.toNumber(),
      saleAddress: deployedAddress,
      saleType: saleData.type,
      github: saleData.github,
      chainID: chainId,
      website: saleData.website,
      twitter: saleData.twitter,
      linkedin: saleData.linkedin,
      discord: saleData.discord,
      telegram: saleData.telegram,
      image: saleData.image,
      whitelistEndDate: saleObject.whitelistEndDate,
      name: saleData.name,
      description: saleData.description,
      tags: saleData.tags,
      token: token,
      firstRelease: saleObject.firstRelease,
      minAllocation: saleObject.minAllocation,
      maxAllocation: saleObject.maxAllocation,
      presalePrice: saleObject.presalePrice,
      endDate: saleObject.endDate,
      startDate: saleObject.startDate,
      hardCap: saleObject.hardCap,
      softCap: saleObject.softCap,
      currency: saleObject.currency,
      dex: saleObject.dex,
      whiteisting: saleObject.whiteisting,
      owner: account,
      isFinished: false,
    };

    return finalSaleObject;
  } catch (error) {
    console.log(error);
    alert("Transaction Failed");
    closeLoadingModal();
  }
};


export const deployPrivateSaleMainnet = async (
  token,
  saleObject,
  library,
  account,
  deploymentFee,
  saleData,
  chainId,
  closeLoadingModal
) => {
  if(chainId!==97){
    alert("Please connect to BSC Testnet");
    return;
  }
  const contract = new Contract(
    Private_FACTORYADRESS,
    PrivateAbi,
    library.getSigner()
  );
  const adminAddress = ADMIN_ADDRESS;

  const saleId = await contract.getNumberOfSalesDeployed();
    console.log(saleObject)
  try {
    const tx = await contract.deployNormalPrivateSale(
      [adminAddress,token.tokenAddress, account],
      [
        parseEther(Number(saleObject.minAllocation).toString()).toString(),
        parseEther(Number(saleObject.maxAllocation).toString()).toString(),
        parseUnits(
          saleObject.presalePrice.toString(),
          token.tokenDecimals
        ).toString(),
        saleObject.endDate,
        saleObject.startDate,
        parseEther(Number(saleObject.hardCap).toString()).toString(),
        parseEther(Number(saleObject.softCap).toString()).toString(),
        100,
      ],
      [saleObject.endDate*60, saleObject.endDate*90, saleObject.endDate*120, saleObject.endDate*150],
      [
        parseFloat(saleObject.percent1),
        parseFloat(saleObject.percent2),
        parseFloat(saleObject.percent3),
        parseFloat(saleObject.percent4),
      ],
      { value: utils.parseEther(deploymentFee) }
    );
    await tx.wait();

    const deployedAddress = await contract.saleIdToAddress(saleId.toNumber());

    const finalSaleObject = {
      saleId: saleId.toNumber(),
      saleAddress: deployedAddress,
      whitelistEndDate: saleObject.whitelistEndDate,
      saleType: saleData.type,
      github: saleData.github,
      chainID: chainId,
      website: saleData.website,
      twitter: saleData.twitter,
      linkedin: saleData.linkedin,
      discord: saleData.discord,
      telegram: saleData.telegram,
      image: saleData.image,
      name: saleData.name,
      description: saleData.description,
      tags: saleData.tags,
      token: token,
      firstRelease: saleObject.firstRelease,
      minAllocation: saleObject.minAllocation,
      maxAllocation: saleObject.maxAllocation,
      presalePrice: saleObject.presalePrice,
      endDate: saleObject.endDate,
      startDate: saleObject.startDate,
      hardCap: saleObject.hardCap,
      softCap: saleObject.softCap,
      currency: saleObject.currency,
      dex: saleObject.dex,
      whiteisting: saleObject.whiteisting,
      owner: account,
      isFinished: false,
    };

    return finalSaleObject;
  } catch (error) {
    console.log(error);
    alert("Transaction Failed");
    closeLoadingModal();
  }
};

// PRIVATE SALE ERC
/* formating break to find functions easily


*/


export const deployPrivateErcSale = async (
  token,
  saleObject,
  library,
  account,
  deploymentFee,
  saleData,
  chainId,
  closeLoadingModal
) => {
  if (chainId !== 97) {
    alert("Please connect to BSC testnet");
    return;
  }
  const contract = new Contract(
    PrivateErc_FACTORYADRESS,
    PrivateErcAbi,
    library.getSigner()
  );
  const adminAddress = ADMIN_ADDRESS;
  // const routerAddress = ROUTER_ADDRESS;
  let PaymentToken = "";
  if (saleObject.currency.name === "Tether") {
    PaymentToken = USDT_ADDRESS;
  } else if (saleObject.currency.name === "Gnosis") {
    PaymentToken = USDC_ADDRESS;
  } else if (saleObject.currency.name === "Roburna") {
    PaymentToken = RBA_ADDRESS;
  }

  const saleId = await contract.getNumberOfSalesDeployed();
  console.log(saleId.toNumber(), "saleId")
  console.log("private erc")
  console.log([adminAddress,token.tokenAddress, account,PaymentToken],"first array")
  console.log([
    parseEther(Number(saleObject.minAllocation).toString()).toString(),
    parseEther(Number(saleObject.maxAllocation).toString()).toString(),
    parseUnits(
      saleObject.presalePrice.toString(),
      token.tokenDecimals
    ).toString(),
    saleObject.endDate,
    saleObject.startDate,
    parseEther(Number(saleObject.hardCap).toString()).toString(),
    parseEther(Number(saleObject.softCap).toString()).toString(),
  ],"second array")
  console.log({ value: utils.parseEther(deploymentFee) },"third array")
  try {
    const tx = await contract.deployERC20PrivateSale(
      [adminAddress,token.tokenAddress, account,PaymentToken],
      [
        parseEther(Number(saleObject.minAllocation).toString()).toString(),
        parseEther(Number(saleObject.maxAllocation).toString()).toString(),
        parseUnits(
          saleObject.presalePrice.toString(),
          token.tokenDecimals
        ).toString(),
        saleObject.endDate,
        saleObject.startDate,
        parseEther(Number(saleObject.hardCap).toString()).toString(),
        parseEther(Number(saleObject.softCap).toString()).toString(),
        100,
      ],
      [saleObject.endDate*60, saleObject.endDate*90, saleObject.endDate*120, saleObject.endDate*150],
      [
        parseFloat(saleObject.percent1),
        parseFloat(saleObject.percent2),
        parseFloat(saleObject.percent3),
        parseFloat(saleObject.percent4),
      ],      { value: utils.parseEther(deploymentFee) }
    );
    await tx.wait();

    const deployedAddress = await contract.saleIdToAddress(saleId.toNumber());

    const finalSaleObject = {
      saleId: saleId.toNumber(),
      whitelistEndDate: saleObject.whitelistEndDate,
      saleAddress: deployedAddress,
      saleType: saleData.type,
      github: saleData.github,
      chainID: chainId,
      website: saleData.website,
      twitter: saleData.twitter,
      linkedin: saleData.linkedin,
      discord: saleData.discord,
      telegram: saleData.telegram,
      image: saleData.image,
      name: saleData.name,
      description: saleData.description,
      tags: saleData.tags,
      token: token,
      firstRelease: saleObject.firstRelease,
      minAllocation: saleObject.minAllocation,
      maxAllocation: saleObject.maxAllocation,
      presalePrice: saleObject.presalePrice,
      endDate: saleObject.endDate,
      startDate: saleObject.startDate,
      hardCap: saleObject.hardCap,
      softCap: saleObject.softCap,
      currency: saleObject.currency,
      dex: saleObject.dex,
      whiteisting: saleObject.whiteisting,
      owner: account,
      isFinished: false,
    };

    return finalSaleObject;
  } catch (error) {
    alert("Transaction Failed");
    console.log(error)
    closeLoadingModal();
  }
};
export const deployPrivateErcSaleMainnet = async (
  token,
  saleObject,
  library,
  account,
  deploymentFee,
  saleData,
  chainId,
  closeLoadingModal
) => {
  if (chainId !== 56) {
    alert("Please connect to BSC mainnet");
    return;
  }
  const contract = new Contract(
    PrivateErc_FACTORYADRESS,
    PrivateErcAbi,
    library.getSigner()
  );
  const adminAddress = ADMIN_ADDRESS;
  const routerAddress = BSC_ROUTER_ADDRESS;
  let PaymentToken = "";
  if (saleObject.currency.name === "Tether") {
    PaymentToken = USDT_ADDRESS_BSC;
  } else if (saleObject.currency.name === "Gnosis") {
    PaymentToken = USDC_ADDRESS_BSC;
  } else if (saleObject.currency.name === "Roburna") {
    PaymentToken = RBA_ADDRESS_BSC;
  }

  const saleId = await contract.getNumberOfSalesDeployed();

  try {
    const tx = await contract.deployERC20PrivateSale(
      [routerAddress, adminAddress, token.tokenAddress, account, PaymentToken],
      [
        parseEther(saleObject.minAllocation.toString()).toString(),
        parseEther(saleObject.maxAllocation.toString()).toString(),
        saleObject.endDate,
        saleObject.startDate,
        parseEther(saleObject.hardCap.toString()).toString(),
        parseEther(saleObject.softCap.toString()).toString(),
        100,
      ],
      [saleObject.endDate*60, saleObject.endDate*90, saleObject.endDate*120, saleObject.endDate*150],
      [
        parseFloat(saleObject.percent1),
        parseFloat(saleObject.percent2),
        parseFloat(saleObject.percent3),
        parseFloat(saleObject.percent4),
      ],
      { value: utils.parseEther(deploymentFee) }
    );
    await tx.wait();

    const deployedAddress = await contract.saleIdToAddress(saleId.toNumber());

    const finalSaleObject = {
      saleId: saleId.toNumber(),
      saleAddress: deployedAddress,
      whitelistEndDate: saleObject.whitelistEndDate,
      saleType: saleData.type,
      github: saleData.github,
      chainID: chainId,
      website: saleData.website,
      twitter: saleData.twitter,
      linkedin: saleData.linkedin,
      discord: saleData.discord,
      telegram: saleData.telegram,
      image: saleData.image,
      name: saleData.name,
      description: saleData.description,
      tags: saleData.tags,
      token: token,
      firstRelease: saleObject.firstRelease,
      minAllocation: saleObject.minAllocation,
      maxAllocation: saleObject.maxAllocation,
      presalePrice: saleObject.presalePrice,
      endDate: saleObject.endDate,
      startDate: saleObject.startDate,
      hardCap: saleObject.hardCap,
      softCap: saleObject.softCap,
      currency: saleObject.currency,
      dex: saleObject.dex,
      whiteisting: saleObject.whiteisting,
      owner: account,
      isFinished: false,
    };

    return finalSaleObject;
  } catch (error) {
    alert("Transaction Failed");
    closeLoadingModal();
  }
};



// Fairlaunch onwards
/* formating break to find functions easily


*/

export const deployFairLaunchSale = async (
  token,
  saleObject,
  library,
  account,
  deploymentFee,
  saleData,
  closeLoadingModal
) => {
  const contract = new Contract(
    FairLaunch_FACTORYADRESS,
    FairAbi,
    library.getSigner()
  );
  const adminAddress = ADMIN_ADDRESS;
  const routerAddress = ROUTER_ADDRESS;

  const saleId = await contract.getNumberOfSalesDeployed();

  try {
    const tx = await contract.deployFairLaunchSale(
      [routerAddress, adminAddress, token.tokenAddress, account],
      [
        parseEther(Number(saleObject.minAllocation).toString()).toString(),
        parseEther(Number(saleObject.maxAllocation).toString()).toString(),
        (saleObject.amountLiquidity * 100).toString(),
        (saleObject.lockup * 86400).toString(),
        saleObject.startDate,
        saleObject.endDate,
        parseEther(Number(saleObject.hardCap).toString()).toString(),
        parseEther(Number(saleObject.softCap).toString()).toString(),
      ],
      { value: utils.parseEther(deploymentFee) }
    );
    await tx.wait();

    const deployedAddress = await contract.saleIdToAddress(saleId.toNumber());

    const finalSaleObject = {
      saleId: saleId.toNumber(),
      saleAddress: deployedAddress,
      saleType: saleData.type,
      github: saleData.github,
      website: saleData.website,
      twitter: saleData.twitter,
      linkedin: saleData.linkedin,
      discord: saleData.discord,
      telegram: saleData.telegram,
      image: saleData.image,
      name: saleData.name,
      description: saleData.description,
      tags: saleData.tags,
      token: token,
      minAllocation: saleObject.minAllocation,
      maxAllocation: saleObject.maxAllocation,
      amountLiquidity: saleObject.amountLiquidity,
      lockup: saleObject.lockup,
      startDate: saleObject.startDate,
      endDate: saleObject.endDate,
      hardCap: saleObject.hardCap,
      softCap: saleObject.softCap,
      currency: saleObject.currency,
      owner: account,
      isFinished: false,
    };

    return finalSaleObject;
  } catch (error) {
    alert("Transaction Failed");
    closeLoadingModal();
  }
};

export const deployFairLaunchSaleERC20 = async (
  token,
  saleObject,
  library,
  account,
  deploymentFee,
  saleData,
  closeLoadingModal
) => {
  const contract = new Contract(
    FairLaunchErc_FACTORYADRESS,
    FairErcAbi,
    library.getSigner()
  );
  const adminAddress = ADMIN_ADDRESS;
  const routerAddress = ROUTER_ADDRESS;
  let PaymentToken = "";
  if (saleObject.currency.name === "Tether") {
    PaymentToken = USDT_ADDRESS;
  } else if (saleObject.currency.name === "Gnosis") {
    PaymentToken = USDC_ADDRESS;
  } else if (saleObject.currency.name === "Roburna") {
    PaymentToken = RBA_ADDRESS;
  }

  const saleId = await contract.getNumberOfSalesDeployed();

  try {
    const tx = await contract.deployFairLaunchSaleERC20(
      [routerAddress, adminAddress, token.tokenAddress, account, PaymentToken],
      [
        parseEther(Number(saleObject.minAllocation).toString()).toString(),
        parseEther(Number(saleObject.maxAllocation).toString()).toString(),
        (saleObject.amountLiquidity * 100).toString(),
        (saleObject.lockup * 86400).toString(),
        saleObject.startDate,
        saleObject.endDate,
        parseEther(Number(saleObject.hardCap).toString()).toString(),
        parseEther(Number(saleObject.softCap).toString()).toString(),
      ],
      { value: utils.parseEther(deploymentFee) }
    );
    await tx.wait();

    const deployedAddress = await contract.saleIdToAddress(saleId.toNumber());

    const finalSaleObject = {
      saleId: saleId.toNumber(),
      saleAddress: deployedAddress,
      saleType: saleData.type,
      github: saleData.github,
      website: saleData.website,
      twitter: saleData.twitter,
      linkedin: saleData.linkedin,
      discord: saleData.discord,
      telegram: saleData.telegram,
      image: saleData.image,
      name: saleData.name,
      description: saleData.description,
      tags: saleData.tags,
      token: token,
      minAllocation: saleObject.minAllocation,
      maxAllocation: saleObject.maxAllocation,
      amountLiquidity: saleObject.amountLiquidity,
      lockup: saleObject.lockup,
      startDate: saleObject.startDate,
      endDate: saleObject.endDate,
      hardCap: saleObject.hardCap,
      softCap: saleObject.softCap,
      currency: saleObject.currency,
      owner: account,
      isFinished: false,
    };

    return finalSaleObject;
  } catch (error) {
    alert("Transaction Failed");
    closeLoadingModal();
  }
};
