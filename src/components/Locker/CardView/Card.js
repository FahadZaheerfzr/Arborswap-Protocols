import ERC20Abi from '../../../config/abi/ERC20.json'
import { formatUnits, parseEther } from 'ethers/lib/utils'
import React, { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CardInfo from './CardInfo'
import Timer from './Timer'
import moment from 'moment'
import { getLpInfo } from 'utils/lpInfo'
import TokenImage from 'components/Common/TokenImage'
import Web3 from 'web3'

export default function Card({ data, token = false }) {
  const [tokenData, setTokenData] = useState(null)
  const [date, setDate] = useState(null)
  const [amount, setAmount] = useState(null)
  console.log(data,"CARD component locker" )
  const getTokenData = async () => {
    const tempData = await getLpInfo(data.info.token)
    setTokenData(tempData.data)
  }

  const fetchAmount = async () => {
    await window.ethereum.enable();
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(ERC20Abi, data.info.token);
    const decimals = await contract.methods.decimals().call();

    const amount = formatUnits(data.info.amount, decimals);
    setAmount(amount);
  }



  useEffect(() => {
    if (!token && data) {
      fetchAmount();;
      getTokenData()
    }
  }, [data, token])


  const unlockDate = useMemo(() => {
    setDate(moment.unix(data.info.unlockDate.toNumber()))
    return moment.unix(data.info.unlockDate.toNumber()).format('YYYY-MM-DD')
  }, [data])

  return (
    <div className="rounded-[20px] bg-white dark:bg-dark-1">
      <div className="px-6">
        <div className="flex justify-between items-center border-b border-dim-text dark:border-dim-text-dark border-dashed border-opacity-30 mt-3 py-5">
          <div className="flex items-center">
            <div className="flex items-center">
            
              <TokenImage className="w-10 h-10 relative z-10" src={data.info.logoImage} alt="BLANK" />
              {tokenData && tokenData.token1?.symbol === "WBNB" ? 
                <img className="w-8 h-8 -ml-5 mr-3 relative z-0" src="/images/cards/bnb.svg" alt="BNB" />
                : null
              }
            </div>

            <div
              className={`flex flex-col justify-center font-bold font-gilroy text-dark-text dark:text-light-text ${
                token ? 'ml-[10px]' : 'ml-0'
              }`}
            >
              <span>{tokenData ? tokenData.token0?.name + "/" + tokenData.token1?.symbol : ''}</span>
              <span className="text-xs font-medium text-dim-text dark:text-dim-text-dark">
                {tokenData ?  tokenData.token0?.symbol + "/" + tokenData.token1?.symbol: ''}
              </span>
            </div>
          </div>
          <Link to={`/locked-assets/${token ? 'token' : 'lp-token'}/${data.address}`}>
            <div className="flex items-center">
              <span className="flex items-center font-medium text-sm font-gilroy text-primary-green ">View</span>
              <img className="rotate-180" src="/images/sidebar/arrow-left.svg" alt="arrow-right" />
            </div>
          </Link>
        </div>

        <div className="flex flex-col justify-between">
        {amount &&
          <CardInfo heading={'Amount'} value={(amount.toString().toLocaleString().substring(0,8))} />
        }
          {/* <CardInfo heading={'Amount ($)'} value={0} /> */}
          <CardInfo heading={'Unlock date'} value={unlockDate} />
        </div>
      </div>

      <div className="bg-[#FAF8F5] dark:bg-dark-2 rounded-b-[20px] py-5 px-7 mt-5 ">
        <div className="flex justify-between items-center">
          <span className="font-medium text-xs text-gray dark:text-gray-dark">Unlocks In</span>
          {date &&
          <Timer date={new Date(date)} />
          }
        </div>
      </div>
    </div>
  )
}
