import './App.css';
import React, { useState, useEffect } from "react";

function App() {
  let [score, setScore] = useState(0);
  let [currentStreak, setCurrentStreak] = useState(0);

  const [isGuessing, setIsGuessing] = useState(true); 
  const [currentSource, setCurrentSource] = useState("interpol");
  const [bgColor, setBgColor] = useState(""); 

  const [image, setImage] = useState(null);
  const [personName, setPersonName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("");
  const [charge, setCharge] = useState(""); 
  const [job, setJob] = useState("");
  const [profileLink, setProfileLink] = useState("");

  const [nextPerson, setNextPerson] = useState(null);

  const codeToFlag = (code) =>
    code.toUpperCase().replace(/./g, char =>
      String.fromCodePoint(127397 + char.charCodeAt())
  );

  const loadNextImage = async () => {
    setIsGuessing(true);
    setBgColor("");

    if (nextPerson) {
      applyPerson(nextPerson.data, nextPerson.source);
      setNextPerson(null);
    } else {
      await prepareNextPerson();
      if (nextPerson) {
        applyPerson(nextPerson.data, nextPerson.source);
        setNextPerson(null);
      }
    }
    prepareNextPerson();
  };

  const applyPerson = (data, source) => {
    setImage(data.image);
    setPersonName(data.name);
    setDateOfBirth(data.dateOfBirth);
    setNationality(data.nationality);
    setCurrentSource(source);

    if (source === "interpol") {
      setProfileLink(data.profileLink);
      setCharge(data.charge);
    } else {
      setJob(data.job);
    }
  };

  const prepareNextPerson = async () => {
    const randomSource = Math.random() < 0.5 ? "interpol" : "linkedin";
    let data;
    if (randomSource === "interpol") {
      data = await generateInterpol();
    } else {
      data = await generateLinkedIn();
    }
    setNextPerson({ data, source: randomSource });
  };

  const guess = (guess) => {
    if (guess === currentSource) {
      setBgColor("green");
      setScore(score + 1);
      setCurrentStreak(currentStreak + 1);
    } else {
      setBgColor("red");
      setCurrentStreak(0);
    }

    setIsGuessing(false);
  };

  const generateInterpol = async () => {
    try{
      const res = await fetch("https://ws-public.interpol.int/notices/v1/red?resultPerPage=160&page=" + (Math.floor(Math.random() * 35) + 1));
      const data = await res.json();

      const randomPerson = data._embedded.notices[Math.floor(Math.random() * data._embedded.notices.length)];
      const imageData = await (await fetch(randomPerson._links.images.href)).json();
      const detailsRes = await fetch(randomPerson._links.self.href);
      const details = await detailsRes.json();
      
      return {
        image: imageData._embedded.images[0]._links.self.href,
        name: `${randomPerson.forename} ${randomPerson.name}`,
        dateOfBirth: randomPerson.date_of_birth,
        nationality: randomPerson.nationalities[0],
        profileLink: `https://www.interpol.int/How-we-work/Notices/Red-Notices/View-Red-Notices#${randomPerson.entity_id.replace('/', '-')}`,
        charge: truncateText(details.arrest_warrants?.[0]?.charge || "No charge info")
      };
    }
    catch(err){
      console.log("Error while loading Interpol: ", err);
    }
  }

  const generateLinkedIn = async () => {
    try {
      const res = await fetch("https://randomuser.me/api/");
      const data = await res.json();
      const user = data.results[0];

      let gender = user.gender.toLowerCase(); 

      const imageUrl = Math.random() < 0.5
      ? `https://xsgames.co/randomusers/avatar.php?g=${gender}&r=${Math.random()}`
      : user.picture.large;

      const jobs = [
        "Software Engineer","Web Developer","UX/UI Designer","Doctor","Teacher","Lawyer","Chef","Photographer",
        "Scientist","Data Analyst","Marketing Specialist","Project Manager","Business Analyst","Product Manager",
        "Architect","Civil Engineer","Mechanical Engineer","Financial Advisor","Accountant","Nurse","Pharmacist",
        "Dentist","Veterinarian","Writer","Journalist","Translator","Artist","Musician","Actor","Pilot",
        "Flight Attendant","Barista","Waiter","Electrician","Plumber","Carpenter","IT Support Specialist",
        "Cybersecurity Analyst","Game Developer","Biologist","Chemist","Mathematician","Statistician",
        "Human Resources Manager","Recruiter","Psychologist","Therapist","Police Officer","Firefighter","Paramedic"
      ];

      return {
        image: imageUrl,
        name: `${user.name.first} ${user.name.last}`,
        dateOfBirth: user.dob.date.split("T")[0].replace(/-/g, '/'),
        nationality: user.nat,
        job: jobs[Math.floor(Math.random() * jobs.length)]
      };
    } 
    catch (err) {
      console.log("Error fetching random person: ", err);
    }
  }

  useEffect(() => {
    
    console.log("⚠️ Disclaimer: For legal reasons, the photos labeled as “LinkedIn” are not taken from LinkedIn. They are randomly generated and do not depict real people. ⚠️");
  }, []);

  const truncateText = (text, maxLength = 66) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength - 3) + "..." : text;
  };

  return (
    <div className="App">
      <div className="main" style={{ backgroundColor: bgColor || "#3d4047" }}>
        <img src={image}></img><br></br>
        {isGuessing ? (
          <>
            <button onClick={() => guess("linkedin")}>LinkedIn</button>
            <button onClick={() => guess("interpol")}>Interpol</button>
          </>
          ) : (
          <button onClick={loadNextImage}>Next</button>
        )}
        <p>Score: {score}</p>
        <p id="streak">🔥Current streak: {currentStreak}</p>
        {!isGuessing ? (
          <>
            <div id="info">
              {currentSource === "interpol" ? (
              <p>
                Name:{" "}
                <a href={profileLink} target="_blank" rel="noopener noreferrer">
                  {personName}
                </a>
              </p>
              ) : (
                <p>Name: {personName}</p>
              )}
              Date of birth: {dateOfBirth}<br></br>
              Nationality: {codeToFlag(nationality)}<br></br>
              {currentSource === "interpol" ? (
                <span>Charge: {charge}</span>
              ) : (
                <span>Job: {job}</span>
              )}
            </div>
          </>
          ) : null}
        
      </div>
    </div>
  );
}

export default App;