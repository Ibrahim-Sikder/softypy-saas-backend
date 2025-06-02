export const amountInWords = (amount: number): string => {
    const numberWords = [
      "Zero",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
  
    const tensWords = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
  
    const convertLessThanOneThousand = (num: number): string => {
      if (num === 0) {
        return "";
      }
  
      let result = "";
  
      if (num >= 100) {
        result += numberWords[Math.floor(num / 100)] + " Hundred ";
        num %= 100;
      }
  
      if (num >= 20) {
        result += tensWords[Math.floor(num / 10)] + " ";
        num %= 10;
      }
  
      if (num > 0) {
        result += numberWords[num] + " ";
      }
  
      return result.trim();
    };
  
    const convert = (num: number): string => {
      if (num === 0) {
        return "Zero";
      }
  
      let result = "";
  
      let integerPart = Math.floor(num);
      const decimalPart = Math.round((num - integerPart) * 100);
  
      if (integerPart >= 10000000) {
        result +=
          convertLessThanOneThousand(Math.floor(integerPart / 10000000)) +
          " Crore ";
        integerPart %= 10000000;
      }
  
      if (integerPart >= 100000) {
        result +=
          convertLessThanOneThousand(Math.floor(integerPart / 100000)) +
          " Lakh ";
        integerPart %= 100000;
      }
  
      if (integerPart >= 1000) {
        result +=
          convertLessThanOneThousand(Math.floor(integerPart / 1000)) +
          " Thousand ";
        integerPart %= 1000;
      }
  
      result += convertLessThanOneThousand(integerPart);
  
      if (decimalPart > 0) {
        result +=
          " Taka and " +
          convertLessThanOneThousand(decimalPart) +
          " Paisa ";
      } else {
        result += " Taka";
      }
  
      return result.trim();
    };
  
    const takaInWords = convert(amount);
    return `${takaInWords} only`;
  };
  