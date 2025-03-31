import { formatDistanceToNow } from "date-fns"

interface Activity {
  id: string
  action: string
  timestamp: string
  user: string
}

interface ActivityFeedProps {
  activities: Activity[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="divide-y">
      {activities.length > 0 ? (
        activities.map((activity) => (
          <div key={activity.id} className="p-4 flex items-start gap-4">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
              {activity.user
                .split(" ")
                .map((name) => name[0])
                .join("")}
            </div>
            <div className="flex-1">
              <p className="text-sm">{activity.action}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })} by {activity.user}
              </p>
            </div>
          </div>
        ))
      ) : (
        <div className="p-4 text-center text-muted-foreground">No recent activity</div>
      )}
    </div>
  )
}

