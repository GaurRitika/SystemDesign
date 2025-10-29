import React , {useState , useEffect} from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [countries ,setCountries] = useState([]);
  const [countryMatch , setCountryMatch] = useState([]);

  //let's use hooks here , useEffect
  useEffect(() => {
    const loadCountries = async () => {
      const response = await axios.get("https://restcountries.com/v3.1/independent?status=true");
      setCountries(response.data);
      };

    loadCountries();
  }, []);
  console.log(countries);
  const searchCountries = (text) => {
    let matches = countries.filter((country)=>{
      const regex = new RegExp(`${text}`  , "gi");
      return country.name.match(regex) || country.capital.match(regex);
    })
    setCountryMatch(matches);
  };
  return (
    <div className = "App">
      <h2>Country Search</h2>
      <Input
        style = {{width : "40%" , marginTop:"10px"}}
        placeholders = "Enter country name or capital name"
        onChange = {(e) => searchCountries(e.target.value)}
          />
      {countryMatch && countryMatch.map((item , index)=>(
      <div key = {index}>
      <Card style = {{ width : "50% }} title = {`Country : ${item.name}`}>
        Capital : {item.capital}
        </Card>
      </div>
      ))}
    </div>
  );
}

export default App;
