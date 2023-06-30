import Web3 from "web3";
import PublicAbi from '../config/abi/PublicLaunchpadAbi.json';
import {Public_FACTORYADRESS } from "config/constants/LaunchpadAddress";

async function getDeploymentFeePublic() {
    const web3 = new Web3(window.ethereum);
    await window.ethereum.enable();
    const contract = new web3.eth.Contract(PublicAbi, Public_FACTORYADRESS);
    const fee = await contract.methods.fee().call();
    console.log(fee, "fee")
    return fee;
}

export default getDeploymentFeePublic;