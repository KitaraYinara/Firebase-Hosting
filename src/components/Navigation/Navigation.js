import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Authentication from "./Authentication";

const Navigation = () => {
  return (
    <Navbar bg="#e3f2fd" expand="lg" variant="dark">
      <Container>
        <Navbar.Brand color="light" href="/">
          SleepEasy
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
