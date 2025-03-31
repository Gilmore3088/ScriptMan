"use client"

export function ElementCard({ element, onClick }) {
  // Add a null check at the beginning
  if (!element) {
    return null
  }

  // Use optional chaining and default values for all properties
  const { name = "", type = "", description = "", tags = [], logo_url } = element

  return (
    <div
      className="border rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onClick && onClick(element)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{name}</h4>
          {description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{description}</p>}
        </div>
        {logo_url && (
          <img src={logo_url || "/placeholder.svg"} alt={`${name} logo`} className="w-10 h-10 object-contain" />
        )}
      </div>

      {/* Only map over tags if it's an array */}
      {Array.isArray(tags) && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.map((tag, index) => (
            <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-2 text-xs text-right">
        <span
          className={`px-2 py-1 rounded ${
            type === "sponsor"
              ? "bg-blue-100 text-blue-800"
              : type === "show_flow"
                ? "bg-purple-100 text-purple-800"
                : "bg-gray-100 text-gray-800"
          }`}
        >
          {type === "sponsor" ? "Sponsor Read" : type === "show_flow" ? "Show Flow Item" : type}
        </span>
      </div>
    </div>
  )
}

