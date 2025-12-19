import { Button } from "@/components/ui/button"

const App = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-2">
      <div className="text-red-500 text-3xl font-bold">App</div>
      <Button size="lg" variant="destructive" className="cursor-pointer">
        Click me
      </Button>
    </div>
  )
}

export default App