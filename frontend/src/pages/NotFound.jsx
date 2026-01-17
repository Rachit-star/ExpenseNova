import { useNavigate } from "react-router-dom";
import "./NotFound.css"; // We will add a tiny bit of CSS below

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="content-box">
        <h1 className="glitch-text" data-text="404">404</h1>
        <h2>Coordinates Unknown</h2>
        <p>
          You have drifted outside the known financial universe.
          Signal lost. Oxygen levels critical.
        </p>
        
        <button className="btn-warp" onClick={() => navigate("/dashboard")}>
          Initiate Emergency Warp
        </button>
      </div>
      
      {/* Optional decorative planet */}
      <div className="lost-planet"></div>
    </div>
  );
}
//done
