import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Index = () => {
  console.log("🔍 Index montado - versión debug");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-8">
        <h1 className="text-3xl font-bold text-center">Debug Mode</h1>
        <p className="text-center mt-4">Si ves esto, el problema está en otro componente.</p>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
