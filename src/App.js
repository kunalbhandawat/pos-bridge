import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import Navbar from "./components/Navbar";
import { CircularProgress, Typography } from "@material-ui/core";
import Alert from '@material-ui/lab/Alert';
import { useWeb3Context } from './contexts/Web3Context';
import config from "./utils/config.json";
import RealmToken from "./utils/RealmToken.json";
import RootToken from "./utils/RootToken.json";

import WalletConnectProvider from "@maticnetwork/walletconnect-provider";
import Web3 from "web3";
const MaticPoSClient = require("@maticnetwork/maticjs").MaticPOSClient;

const App = () => {
  const classes = useStyles();
  const { account, providerChainId, inj_provider, connectWeb3 } = useWeb3Context();

  const [loading, setLoading] = useState(false);
  const [loadingEth,setLoadingEth] = useState(false);
  const [loadingBurn, setBurnLoading] = useState(false);
  const [loadingTransfer, setTransferLoading] = useState(false);
  const [loadingApprove,setApproveLoading] = useState(false);
  const [loadingApproveReset,setApproveResetLoading] = useState(false);
  const [loadingApproveAll,setApproveAllLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [inputTransferValue, setInputTransferValue] = useState("");
  const [inputBurnValue, setInputBurnValue] = useState("");
  const [inputApproveValue,setInputApproveValue] = useState("");
  const [maticProvider, setMaticProvider] = useState();
  const [ethereumprovider, setEthereumProvider] = useState();
  const [burnHash, setBurnHash] = useState("");
  const [hash, setHash] = useState('');
  const [error, setError] = useState('');
  const [errorTransfer, setTransferError] = useState('');
  const [errorBurn, setBurnError] = useState('');
  const [errLink, setErrLink] = useState(false);
  const [approved,setApproved] = useState("0");
  const [burnHashes,setBurn] = useState();
  const [inputAddress,setAddress] = useState("");
  const [inputTransfer,setTransfer] = useState("");
  useEffect(() => { 
    if (!account) {
      connectWeb3();
    }
  }, [account, connectWeb3])

  useEffect(() => {
    const setProvider = async () => {
      setLoading(true);
      // matic provider set
      const maticProvider = await new WalletConnectProvider({
        host: config.MATIC_RPC,
        callbacks: {
          onConnect: console.log("matic connected"),
          onDisconnect: console.log("matic disconnected!"),
        },
      });

      const ethereumProvider = new WalletConnectProvider({
        host: config.ETHEREUM_RPC,
        callbacks: {
          onConnect: console.log("mainchain connected"),
          onDisconnect: console.log("mainchain disconnected"),
        },
      });
      console.log(ethereumProvider);
      console.log(maticProvider);
      setMaticProvider(maticProvider);
      setEthereumProvider(ethereumProvider);
      setLoading(false);
    }
    setProvider();

  }, [])

  useEffect(()=>{
    setBurnHash("");
  },[providerChainId])

  useEffect(()=>{
    if(burnHash !== ""){
    let hashes = JSON.parse(localStorage.getItem("BurnTxn"));
    let hashtxn = new Array();
    for(let x in hashes){
      console.log(x);
      hashtxn.push(hashes[x]);
    }   
    hashtxn.push(burnHash);
    localStorage.setItem("BurnTxn",JSON.stringify(hashtxn));
    }
  },[burnHash])
  
  useEffect(()=>{
     let hashes = JSON.parse(localStorage.getItem("BurnTxn"));
     setBurn(JSON.parse(localStorage.getItem("BurnTxn")));
     if(hashes){
     setInputValue(hashes[0]);
      }
     else{
       setInputValue("");
     }
  },[]);

  const allowance = async () =>{
    const contract = await new inj_provider.eth.Contract(RootToken.abi,config.posRootERC20);
    const allowance =await contract.methods.allowance(account,"0xdD6596F2029e6233DEFfaCa316e6A95217d4Dc34").call();
    setApproved(allowance/1000000000000000000);
  }
  if(inj_provider !== undefined && account && providerChainId === config.ETHEREUM_CHAINID){
    allowance();
  }
  
  // posClientGeneral facilitates the operations like approve, deposit, exit
  const posClientParent = () => {
    const maticPoSClient = new MaticPoSClient({
      network: config.NETWORK,
      version: config.VERSION,
      maticProvider: maticProvider,
      parentProvider: inj_provider,
      parentDefaultOptions: { from: account },
      maticDefaultOptions: { from: account },
    });
    return maticPoSClient;
  };
    // posclientBurn facilitates the burning of tokens on the matic chain
    const posClientChild = () => {
      const maticPoSClient = new MaticPoSClient({
        network: config.NETWORK,
        version: config.VERSION,
        maticProvider: inj_provider,
        parentProvider: ethereumprovider,
        parentDefaultOptions: { from: account },
        maticDefaultOptions: { from: account },
      });
      return maticPoSClient;
    };

  //ERC1155 POS
  // const approveERC1155 = async ()=>{
  //   const maticPoSClient = posClientParent();
  //   await maticPoSClient.approveERC1155ForDeposit("0x5B14815235cBf526eB8928C46123Cd7ba1975d98", { from:account}).then(()=>{
  //     console.log("approved ERC1155");
  //   });
  // }
  // const depositERC1155 = async ()=>{
  //   const maticPoSClient = posClientParent();
  //   await maticPoSClient.depositSingleERC1155ForUser('0x5B14815235cBf526eB8928C46123Cd7ba1975d98', account,'0','1').then(()=>{
  //     console.log("ERC1155 deposit to matic");
  //   });
  // }

  // const burnERC1155 = async () =>{
  //   const maticPoSClient = posClientChild();
  //   await maticPoSClient.burnSingleERC1155("0xA43Dae138abB5E0BDDD32ACAbE65e0BBB9067f93", '0', '1', {
  //     from:account,
  //     gasPrice: "10000000000"
  //   }).then((res)=>{
  //     console.log(res.transactionHash);
  //     console.log("Burned ERC1155");
  //   });

  // }

  // const exitERC1155 = async () =>{
  //   const maticPoSClient = posClientParent();
  //   try{
  //   await maticPoSClient.exitSingleERC1155("0xf01ab72616dc31e12fdc9f8ba56852931680c50aac846414a2669994ca730c65", { from:account }).then(()=>{
  //     console.log("exit ERC1155");
  //   });
  // }catch(err){
  //   console.log(err.message);
  // }

  // }


  //ERC20 Transfer on Ethereum 
  const Transfer = async ()=>{
    
    
    try{
      setLoadingEth(true);
      const web3 = new Web3(window.ethereum);
      const contract = await new web3.eth.Contract(RootToken.abi,config.posRootERC20);
      const x =inputTransfer * 1000000000000000000;;
      const x1=x.toString();
      await contract.methods.transfer(inputAddress,x1).send({from:account}).then(()=>{
        setLoadingEth(false);
        setTransfer("");
        setAddress("");
        
      });
    }catch(e){
      setLoadingEth(false);
      console.log(e);
    }
  }
  // POS ERC20 Approve function
  const ApproveERC20 = async () =>{
    const maticPoSClient = posClientParent();
    const x = inputApproveValue * 1000000000000000000; // 18 decimals
    const x1 = x.toString();
    try{
      setApproveLoading(true);
      await maticPoSClient.approveERC20ForDeposit(config.posRootERC20, x1, {
        from: account,
      }).then(()=>{
        setApproveLoading(false);
        setApproved(inputApproveValue);
      });
    }
    catch(err){
      setApproveLoading(false);
      console.log(err);
    }
  }

  const approveAll = async () => {
    const maticPoSClient = posClientParent();
    const contract = await new inj_provider.eth.Contract(RootToken.abi,config.posRootERC20);
    const x1 = await contract.methods.balanceOf(account).call();
    console.log(typeof(x1));
    console.log(x1);
    try{
      setApproveAllLoading(true);
      await maticPoSClient.approveERC20ForDeposit(config.posRootERC20, x1, {
        from: account,
      }).then(()=>{
        setApproveAllLoading(false);
        setApproved(x1/1000000000000000000);
      });
    }
    catch(err){
      setApproveAllLoading(false);
      console.log(err);
    }
    
  }

  const resetApprove  = async () => {
    const maticPoSClient = posClientParent();
    const x1 = "0";

    try{
      setApproveResetLoading(true);
      await maticPoSClient.approveERC20ForDeposit(config.posRootERC20, x1, {
        from: account,
      }).then(()=>{
        setApproveResetLoading(false);
        setApproved(x1);
      });
    }
    catch(err){
      setApproveResetLoading(false);
      console.log(err);
    }

  }
  //POS ERC20 Deposit function
  const depositERC20 = async () => {
    const maticPoSClient = posClientParent();
    const x = inputTransferValue * 1000000000000000000; // 18 decimals
    const x1 = x.toString();
    
    try{
      setTransferLoading(true);
      await maticPoSClient.depositERC20ForUser(config.posRootERC20, account, x1, {
      from: account,
    }).then(()=>{
      setTransferLoading(false);
      setApproved(approved-inputTransferValue);
    });

  }catch(err){
    setTransferLoading(false);
    if(err.message === "MetaMask Tx Signature: User denied transaction signature.")
         setTransferError('Transaction Denied');
    console.log(err);
  }
  };

  //POS ERC20 Burn function
  const burnERC20 = async () => {
    
    const maticPoSClient = posClientChild();
    const x = inputBurnValue * 1000000000000000000;
    const x1 = x.toString();
    try{
    setBurnLoading(true);
    await maticPoSClient
      .burnERC20(config.posChildERC20, x1, {
        from: account,
      })
      .then((res) => {
       setBurnHash(res.transactionHash);
       setInputValue(res.transactionHash);
       setBurnLoading(false);
      });
    }catch(err){ 
      setBurnLoading(false);
       
      if (err.message === `execution reverted: ERC20: burn amount exceeds balance`)
          setBurnError('Burn amount exceeds balance');
      console.log(err);
    }
  };

  // POS ERC20 exit function
  const exitERC20 = async () => {
    setError('');
    setHash('');
    setErrLink(false);
    try {
      setLoading(true);
      const maticPoSClient = posClientParent();
      const isDone = await maticPoSClient.isERC20ExitProcessed(inputValue);
      console.log(isDone);
      if (isDone) {
        setLoading(false);
        console.log("EXIT ALREADY PROCESSED");
        setError('Withdraw process completed already.');
        return;
      } 
      await maticPoSClient
        .exitERC20(inputValue, {
          from: account,
        })
        .then((res) => {
          let hashes = JSON.parse(localStorage.getItem("BurnTxn"));
          if(hashes !== null){
          let index = hashes.indexOf(hashes[0]);
          hashes.splice(index,1);
          localStorage.setItem("BurnTxn",JSON.stringify(hashes));
          }
          hashes = JSON.parse(localStorage.getItem("BurnTxn"));
          if(hashes !== null){
            setInputValue(hashes[0]);
          }else{
            setInputValue("");
          }
          console.log("Exit transaction hash: ", res);
          setHash(res.transactionHash);
          setLoading(false);
        });
    } catch (e) {
      setLoading(false);
      if (e.message.substr(0, 28) === `Returned values aren't valid`)
        setError('Seems like you are not on Ethereum Network, change the network and refresh the page.')

      else if (e.message === `Cannot read property 'blockNumber' of null`)
        setError('Incorrect burn transaction hash')

      else if (e.message === `txHash not provided`)
        setError('Please input the transaction hash.')

      else if (e.message.substr(0, 32) === `Returned error: invalid argument`)
        setError('Incorrect burn transaction hash')

      else if (e.message.substr(0, 49) === `Burn transaction has not been checkpointed as yet`)
        setError('Burn transaction has not been checkpointed yet. Please wait for 10-15 min.')

      else if (e.message.substr(0, 53) === `Invalid parameters: must provide an Ethereum address.`)
        setError('Please refresh the page and try again.')

      else if (e.message === `Log not found in receipt`)
        setErrLink(true);

      else if (e.message === 'Invalid response')
        setError('Please try again after some time.');

      else setError(e.message.substr(0, 80));
      console.error(e);
    }
  };

  console.log(burnHashes);

  return (
    <React.Fragment>
      {/* Navbar */}
      <Navbar />

      {/* Top Intro section */}
      <div className={classes.inroTransfer}>
        <Typography variant="h1" className={classes.title}>
           Transfer your Realm Tokens on Ethereum
        </Typography>
        <Typography variant="h1" className={classes.text}>
          Enter the recipient address and the quantity of tokens to be transfered.
        </Typography>
        <div className={classes.input_u}>
          <input type="text" placeholder="Recipient's address" name="inputAddress"
            value={inputAddress} onChange={(e) => setAddress(e.target.value)} required
          />
        </div>
        <div>&nbsp;</div>
        <div className={classes.input_u}>
          <input type="text" placeholder="Quantity of Tokens" name="inputTransfer"
            value={inputTransfer} onChange={(e) => setTransfer(e.target.value)} required
          />
        </div>
      <section className={classes.body}>
      <div>&nbsp;</div>
      <div>&nbsp;</div>
        <button className={classes.btn} onClick={Transfer}
          disabled={providerChainId === config.ETHEREUM_CHAINID && !loadingEth && account ? false : true}>
          {loadingEth && <CircularProgress size={24} style={{ margin: 'auto', marginRight: 15 }} />}
          {loadingEth ? 'Transfering...' : 'Transfer'}
        </button>
        
        {providerChainId && providerChainId !== config.ETHEREUM_CHAINID &&
          <Alert severity="error">
            Seems like you are not on Eth Network, change the network and refresh the page.
          </Alert>
        }
      </section>
</div>
      
      <div className={classes.inro_u}>
        <Typography variant="h1" className={classes.title_u}>
           Approve the Realm Tokens
        </Typography>
        <Typography>Total Approved Tokens: {approved}</Typography>
        <Typography variant="h1" className={classes.text_u}>
          Enter the quantity of tokens to be approved.
        </Typography>
     
      <section className={classes.body}>
        <div className={classes.input_u}>
          <input type="text" placeholder="Quantity of Tokens" name="inputApproveValue"
            value={inputApproveValue} onChange={(e) => setInputApproveValue(e.target.value)} required
          />
        </div>

        <button className={classes.btn_u} onClick={ApproveERC20}
          disabled={providerChainId === config.ETHEREUM_CHAINID && !loadingApprove && account ? false : true}>
          {loadingApprove && <CircularProgress size={24} style={{ margin: 'auto', marginRight: 15 }} />}
          {loadingApprove ? 'Approving...' : 'Approve'}
        </button>

        <div>
        <button className={classes.btn_u1} onClick={approveAll}
          disabled={providerChainId === config.ETHEREUM_CHAINID && !loadingApproveAll && account ? false : true}>
          {loadingApproveAll && <CircularProgress size={24} style={{ margin: 'auto', marginRight: 15 }} />}
          {loadingApproveAll ? 'Approving...' : 'Approve All'}
        </button>
        <button className={classes.btn_u1} onClick={resetApprove}
          disabled={providerChainId === config.ETHEREUM_CHAINID && !loadingApproveReset && account ? false : true}>
          {loadingApproveReset && <CircularProgress size={24} style={{ margin: 'auto', marginRight: 15 }} />}
          {loadingApproveReset ? 'Resetting...' : 'Reset'}
        </button>
         
        </div>

        {errorTransfer &&
          <Alert severity="error">
            {errorTransfer}
          </Alert>
        }
        {providerChainId && providerChainId !== config.ETHEREUM_CHAINID &&
          <Alert severity="error">
            Seems like you are not on Eth Network, change the network and refresh the page.
          </Alert>
        }
      </section>
</div>


      {/* Top Intro section */}
      <div className={classes.inroTransfer}>
        <Typography variant="h1" className={classes.title}>
           Transfer your Realm Tokens
        </Typography>
        <Typography variant="h1" className={classes.text}>
          Enter the quantity of tokens to be transfered to Polygon.
        </Typography>
      
      <section className={classes.body}>
        <div className={classes.input_u}>
          <input type="text" placeholder="Quantity of Tokens" name="inputTransferValue"
            value={inputTransferValue} onChange={(e) => setInputTransferValue(e.target.value)} required
          />
        </div>

        <button className={classes.btn_u} onClick={depositERC20}
          disabled={providerChainId === config.ETHEREUM_CHAINID && !loadingTransfer && account ? false : true}>
          {loadingTransfer && <CircularProgress size={24} style={{ margin: 'auto', marginRight: 15 }} />}
          {loadingTransfer ? 'Transfering...' : 'Deposit'}
        </button>

        {errorTransfer &&
          <Alert severity="error">
            {errorTransfer}
          </Alert>
        }
        {providerChainId && providerChainId !== config.ETHEREUM_CHAINID &&
          <Alert severity="error">
            Seems like you are not on Eth Network, change the network and refresh the page.
          </Alert>
        }
      </section>
</div>

<div className={classes.inro_u}>
        <Typography variant="h1" className={classes.title_u}>
           Burn your Realm Tokens
        </Typography>
        <Typography variant="h1" className={classes.text_u}>
          Enter the quantity of tokens to be burn on Polygon.
        </Typography>
      
      <section className={classes.body}>
        <div className={classes.input_u}>
          <input type="text" placeholder="Quantity of Tokens" name="inputBurnValue"
            value={inputBurnValue} onChange={(e) => setInputBurnValue(e.target.value)} required
          />
        </div>

        <button className={classes.btn_u} onClick={burnERC20}
          disabled={providerChainId === config.MATIC_CHAINID && !loadingBurn && account ? false : true}>
          {loadingBurn && <CircularProgress size={24} style={{ margin: 'auto', marginRight: 15 }} />}
          {loadingBurn ? 'Burning...' : 'Burn'}
        </button>      
        {providerChainId && providerChainId !== config.MATIC_CHAINID &&
          <Alert severity="error">
            Seems like you are not on Matic Network, change the network and refresh the page.
          </Alert>
        }

        {burnHash &&
          <Alert severity="success">
            Burn transaction hash: <a target="blank" href={`https://etherscan.io/tx/${hash}`} rel="noreferrer">{burnHash}</a>
          </Alert>
        }
        {errorBurn &&
          <Alert severity="error">
            {errorBurn}
          </Alert>
        }

      </section>
</div>




      <div className={classes.inro}>
        <Typography variant="h1" className={classes.title}>
          Withdraw Realm
        </Typography>

        <Typography variant="h1" className={classes.text}>
          Paste the transaction hash of your burn transaction on Polygon and click on Complete Withdraw.<br />
        </Typography>
      </div>
  
      {/* Input section */}
      <section className={classes.body}>
      <div className={classes.input}>   
            <input list="txn" type="text" placeholder="0xaa30bf8f73dfdaa..." name="inputValue" onChange={(e)=> setInputValue(e.target.value)}  required/>
            </div>
            <datalist id="txn"> 
          { burnHashes !== undefined && burnHashes !== null &&
              burnHashes.map((index) =>{
              return(
                <option value={index}></option>
                 )
            })}
             </datalist>

        <button className={classes.btn} onClick={exitERC20}
          disabled={providerChainId === config.ETHEREUM_CHAINID && !loading && account ? false : true}>
          {loading && <CircularProgress size={24} style={{ margin: 'auto', marginRight: 15 }} />}
          {loading ? 'checking...' : 'Complete Withdraw'}
        </button>
        {hash &&
          <Alert severity="success">
            Exit transaction hash: <a target="blank" href={`https://etherscan.io/tx/${hash}`} rel="noreferrer">{hash}</a>
          </Alert>
        }
        {error &&
          <Alert severity="error">
            {error}
          </Alert>
        }
        {errLink &&
          <Alert severity="error">
            Please reach out to <a target="blank" style={{ color: '#0d6efd', textDecoration: 'underline' }}
              href="https://wallet-support.matic.network/portal/en/home" rel="noreferrer">support team</a> {' '}.
          </Alert>
        }
        {providerChainId && providerChainId !== config.ETHEREUM_CHAINID &&
          <Alert severity="error">
            Seems like you are not on Eth Network, change the network and refresh the page.
          </Alert>
        }
      </section>

 {/* <button onClick={approveERC1155}>Approve ERC1155</button>     
 <button onClick={depositERC1155}>deposit ERC1155</button> 
 <button onClick={burnERC1155}>Burn ERC1155</button> 
 <button onClick={exitERC1155}>Exit ERC1155</button>  */}
 
    </React.Fragment>
  );
};

export default App;

const useStyles = makeStyles(() => ({
  btn_u1:{
    height: "44px",
    lineHeight: "44px",
    padding: "0 20px",
    borderRadius: "4px",
    textTransform: "capitalize",
    fontWeight: "600",
    fontSize: 16,
    backgroundColor: "#061024",
    color: "white",
    cursor: 'pointer',
    marginBottom: 20,
    marginLeft:"5px",

    "&:disabled": {
      backgroundColor: "#bdc3c7",
      borderColor: "#bdc3c7",
      color: "white",
      border: 'none',
      cursor: 'default'
    },
  },
  btn: {
    height: "44px",
    lineHeight: "44px",
    padding: "0 20px",
    borderRadius: "4px",
    display: "inline-flex",
    textTransform: "capitalize",
    fontWeight: "600",
    fontSize: 16,
    position: "relative",
    backgroundColor: "#061024",
    color: "white",
    cursor: 'pointer',
    marginBottom: 20,

    "&:disabled": {
      backgroundColor: "#bdc3c7",
      borderColor: "#bdc3c7",
      color: "white",
      border: 'none',
      cursor: 'default'
    },
  },
  inro: {
    height: 200,
    backgroundColor: '#854CE6',
    textAlign: 'center',
    padding: '35px 0'
  },
  title: {
    marginBottom: 20,
    fontSize: 36,
    fontWeight: 800,
    color: '#FFFFFF',
  },
  text: {
    fontSize: 16,
    fontWeight: 400,
    color: "#FFFFFF",
  },
  body: {
    position: 'relative',
    textAlign: 'center',
    maxWidth: 852,
    margin: 'auto',
  },
  input: {
    maxWidth: 500,
    position: 'relative',
    top: -30,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: "white",
    border: '1px solid #DCDFE6',
    padding: '18px 15px',
    boxSizing: 'border-box',
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.08)',
    borderRadius: 8,

    "& input": {
      background: "transparent",
      fontSize: "16px",
      fontWeight: "600",
      color: "black",
      display: "block",
      border: 0,
      outline: "none",
      padding: 0,
      width: '100%',
    },
  },
  inroTransfer: {
    height: 420,
    backgroundColor: '#854CE6',
    textAlign: 'center',
    padding: '35px 0'
  },
  inro_u: {
    height: 380,
    backgroundColor: '#EFE7FD',
    textAlign: 'center',
    padding: '35px 0'
  },
  title_u: {
    marginBottom: 20,
    fontSize: 36,
    fontWeight: 800,
    color: '#854CE6',
  },
  text_u: {
    fontSize: 16,
    fontWeight: 400,
    color: "#061024",
  },
  input_u: {
    maxWidth: 500,
    position:'relative',
    top: 30,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: "white",
    border: '1px solid #DCDFE6',
    padding: '18px 15px',
    boxSizing: 'border-box',
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.08)',
    borderRadius: 8,

    "& input": {
      background: "transparent",
      fontSize: "16px",
      fontWeight: "600",
      color: "black",
      display: "block",
      border: 0,
      outline: "none",
      padding: 0,
      width: '100%',
    },
  },
  btn_u: {
    height: "44px",
    lineHeight: "44px",
    padding: "0 20px",
    borderRadius: "4px",
    display: "inline-flex",
    textTransform: "capitalize",
    fontWeight: "600",
    fontSize: 16,
    position: "relative",
    left:380,
    top:-20,
    backgroundColor: "#061024",
    color: "white",
    cursor: 'pointer',
    marginBottom: 20,

    "&:disabled": {
      backgroundColor: "#bdc3c7",
      borderColor: "#bdc3c7",
      color: "white",
      border: 'none',
      cursor: 'default'
    },
  }
}));

