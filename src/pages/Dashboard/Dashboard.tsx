import "./Dashboard.css"

export default function Dashboard(){

return(

<div className="dashboard">

<h1 className="dashboard-title">
Panel Bancario
</h1>

<div className="accounts">

<div className="account-card">

<h3>Cuenta Ahorros</h3>

<p className="balance">
RD$ 120,000
</p>

</div>

<div className="account-card">

<h3>Cuenta Corriente</h3>

<p className="balance">
RD$ 35,000
</p>

</div>

<div className="account-card">

<h3>Tarjeta Crédito</h3>

<p className="balance">
RD$ -7,800
</p>

</div>

</div>

</div>

)

}