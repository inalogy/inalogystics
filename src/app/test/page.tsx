export default function TestPage() {
  return (
    <div className="min-h-screen bg-red-500">
      <h1 className="text-4xl font-bold text-white p-8">CSS Test Page</h1>
      <div className="bg-blue-500 p-4 m-4 rounded-lg">
        <p className="text-white">If you see colors, Tailwind is working!</p>
      </div>
      <div className="ina-card m-4 p-4">
        <p>This is a custom card component</p>
      </div>
      <button className="ina-button-primary m-4">Test Button</button>
    </div>
  )
}