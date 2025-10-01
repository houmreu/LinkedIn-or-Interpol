import './App.css';
import React, { useState, useEffect } from "react";

function App() {
  let [score, setScore] = useState(0);
  let [currentStreak, setCurrentStreak] = useState(0);

  const [isGuessing, setIsGuessing] = useState(true); 
  const [currentSource, setCurrentSource] = useState("interpol");
  const [bgColor, setBgColor] = useState(""); 

  const [person, setPerson] = useState(null);
  const [image, setImage] = useState(null);
  const [personName, setPersonName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("");
  const [charge, setCharge] = useState(""); 
  const [job, setJob] = useState("");
  const [profileLink, setProfileLink] = useState("");

  const codeToFlag = (code) =>
    code.toUpperCase().replace(/./g, char =>
      String.fromCodePoint(127397 + char.charCodeAt())
  );

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

  const loadNextImage = () => {
    const randomSource = Math.random() < 0.5 ? "interpol" : "linkedin";
    setCurrentSource(randomSource);
    setIsGuessing(true);
    setBgColor("");

    if(randomSource === "interpol") generateInterpol();
    else if (randomSource === "linkedin") generateLinkedIn();
  }

  const generateInterpol = async () => {
    try{
      const res = await fetch("https://ws-public.interpol.int/notices/v1/red?resultPerPage=160&page=" + (Math.floor(Math.random() * 35) + 1));
      const data = await res.json();

      const randomPerson = data._embedded.notices[Math.floor(Math.random() * data._embedded.notices.length)];
      const imageData = await (await fetch(randomPerson._links.images.href)).json();
      setImage(imageData._embedded.images[0]._links.self.href);
      setPersonName(`${randomPerson.forename} ${randomPerson.name}`);
      setDateOfBirth(randomPerson.date_of_birth);
      setNationality(randomPerson.nationalities[0]);
      setPerson(randomPerson);
      setProfileLink(`https://www.interpol.int/How-we-work/Notices/Red-Notices/View-Red-Notices#${randomPerson.entity_id.replace('/', '-')}`
);

      const detailsRes = await fetch(randomPerson._links.self.href);
      const details = await detailsRes.json();
      setCharge(truncateText(details.arrest_warrants?.[0]?.charge || "No charge info"));
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

      const randomPerson = {
        firstName: user.name.first,
        lastName: user.name.last,
        date_of_birth: user.dob.date.split("T")[0].replace(/-/g, '/'),
        nationality: user.nat,
        image: imageUrl
      };
      setImage(randomPerson.image);
      setPersonName(`${randomPerson.firstName} ${randomPerson.lastName}`);
      setDateOfBirth(randomPerson.date_of_birth);
      setNationality(randomPerson.nationality);
      setPerson(randomPerson);

      const jobs = [
        "Software Engineer","Web Developer","UX/UI Designer","Doctor","Teacher","Lawyer","Chef","Photographer",
        "Scientist","Data Analyst","Marketing Specialist","Project Manager","Business Analyst","Product Manager",
        "Architect","Civil Engineer","Mechanical Engineer","Financial Advisor","Accountant","Nurse","Pharmacist",
        "Dentist","Veterinarian","Writer","Journalist","Translator","Artist","Musician","Actor","Pilot",
        "Flight Attendant","Barista","Waiter","Electrician","Plumber","Carpenter","IT Support Specialist",
        "Cybersecurity Analyst","Game Developer","Biologist","Chemist","Mathematician","Statistician",
        "Human Resources Manager","Recruiter","Psychologist","Therapist","Police Officer","Firefighter","Paramedic"
      ];
      setJob(jobs[Math.floor(Math.random() * jobs.length)]);
    } 
    catch (err) {
      console.log("Error fetching random person: ", err);
    }
  }

  useEffect(() => {
    if(person == null) loadNextImage();
    console.log("new page");
    console.log("⚠️ Disclaimer: For legal reasons, the photos labeled as “LinkedIn” are not taken from LinkedIn. They are randomly generated and do not depict real people. ⚠️");
  }, [])

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