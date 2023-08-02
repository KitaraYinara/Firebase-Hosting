import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Authentication from "./Authentication";
import brandlogo from "./SleepeasyLOGOweb-1513748087.png";
const Navigation = () => {
  return (
    <Navbar expand="lg" variant="light">
      <Container>
        <Navbar.Brand color="light" href="/">
          <img src={brandlogo} width="150" height="50" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Authentication />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
