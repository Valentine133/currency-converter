import React, { useState, useEffect } from 'react';
import CurrencyRow from './components/CurrencyRow';
import axios from 'axios';

function App() {
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [fromCurrency, setFromCurrency] = useState();
  const [toCurrency, setToCurrency] = useState();
  const [exchangeRate, setExchangeRate] = useState();
  const [amount, setAmount] = useState(1);
  const [amountInFromCurrency, setAmountInFromCurrency] = useState(true);

  let toAmount, fromAmount;

  if (amountInFromCurrency) {
    fromAmount = amount;
    toAmount = amount * exchangeRate || 0;
  } else {
    toAmount = amount;
    fromAmount = amount / exchangeRate;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}?base=USD&apikey=${process.env.REACT_APP_ACCESS_KEY}`
        );
        const data = response.data;

        const baseCurrency = data.base;
        const secondCurrency = 'UAH';
        const ratesKeys = Object.keys(data.rates);

        setCurrencyOptions([baseCurrency, ...ratesKeys]);
        setFromCurrency(baseCurrency);
        setToCurrency(secondCurrency);
        setExchangeRate(data.rates[secondCurrency]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [])

  useEffect(() => {
    const fetchChangeData = async () => {
      if (fromCurrency === toCurrency && fromCurrency != null) {
        setExchangeRate(1);
      } else if(fromCurrency != null && toCurrency != null) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_BASE_URL}?base=${fromCurrency}&symbols=${toCurrency}&apikey=${process.env.REACT_APP_ACCESS_KEY}`
          );
          const data = response.data;

          if (data.rates && data.rates[toCurrency] !== undefined) {
            setExchangeRate(data.rates[toCurrency]);
          } else {
            console.error(`Exchange rate for ${toCurrency} not available.`);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    }

    fetchChangeData();
  },[fromCurrency, toCurrency])

  const handleFromAmountChange = (event) => {
    setAmount(event.target.value);
    setAmountInFromCurrency(true);
  };

  const handleToAmountChange = (event) => {
    setAmount(event.target.value);
    setAmountInFromCurrency(false);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-700">
      <div className="container mx-auto p-4">
        <header className="shadow-md p-4 flex flex-col lg:flex-row gap-4 items-center justify-center rounded-xl bg-indigo-500">
          <h1 className="text-2xl font-bold text-white">Currency convertor</h1>
          <CurrencyRow
            currencyOptions={currencyOptions}
            selectedCurrency={fromCurrency}
            onChangeCurrency={(event) => setFromCurrency(event.target.value)}
            onChangeAmount={handleFromAmountChange}
            amount={fromAmount}
          />
          <CurrencyRow
            currencyOptions={currencyOptions}
            selectedCurrency={toCurrency}
            onChangeCurrency={(event) => setToCurrency(event.target.value)}
            onChangeAmount={handleToAmountChange}
            amount={toAmount}
          />
        </header>
      </div>
    </div>
  );
}

export default App;
