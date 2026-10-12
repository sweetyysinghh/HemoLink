import Navbar from "../../components/layout/Navbar/Navbar";
import Hero from "../../components/landing/Hero/Hero";
import Statistics from "../../components/landing/Statistics/Statistics";
import LandingSections from "../../components/landing/LandingSections";
import Footer from "../../components/layout/Footer/Footer";

function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Statistics />
        <LandingSections />
      </main>
      <Footer />
    </>
  );
}

export default Home;