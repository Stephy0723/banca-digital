import "./Login.css"
import { useNavigate } from "react-router-dom"

export default function Login(){

const navigate = useNavigate()

return(

<div className="login-container">

<div className="login-box">

<h2 className="login-title">
Banca en Línea
</h2>

<input
className="login-input"
placeholder="Usuario"
/>

<input
type="password"
className="login-input"
placeholder="Contraseña"
/>

<button
className="login-button"
onClick={()=>navigate("/dashboard")}
>
Entrar
</button>

</div>

</div>

)

}