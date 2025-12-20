import { Button } from "@/components/ui/button";

import { ThemeToggle } from "./components/ui/ThemeToggle";

const App = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-2">
      <div className="text-primary dark:text-primary  bg-background dark:bg-dark-background  text-3xl font-bold">
        App
      </div>
      <ThemeToggle />
      <Button size="lg" variant="destructive" className="cursor-pointer">
        Click me
      </Button>
    </div>
  );
};

export default App;
