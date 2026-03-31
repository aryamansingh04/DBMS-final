import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { InventoryProvider } from "@/context/InventoryContext";
import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import AddProduct from "@/pages/AddProduct";
import Products from "@/pages/Products";
import InventoryManage from "@/pages/InventoryManage";
import VoiceCommand from "@/pages/VoiceCommand";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <InventoryProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/add-product" element={<AddProduct />} />
                <Route path="/products" element={<Products />} />
                <Route path="/inventory" element={<InventoryManage />} />
                <Route path="/voice" element={<VoiceCommand />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </InventoryProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
