import { 
  IconCreditCard, 
  IconKey, 
  IconActivity, 
  IconServer 
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards({ stats }) {
  // Default values if data hasn't loaded yet
  const {
    credits = 0,
    daily_free = 0,
    active_keys = 0,
    total_calls_24h = 0,
    success_rate = 100
  } = stats || {};

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      
      {/* CARD 1: Credits */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Remaining Credits</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {credits}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconCreditCard className="mr-1 size-3" />
              Paid
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
             Daily Free Reset: {daily_free}/20
          </div>
          <div className="text-muted-foreground">
            Available for API calls
          </div>
        </CardFooter>
      </Card>

      {/* CARD 2: Active Keys */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active API Keys</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {active_keys}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
              <IconKey className="mr-1 size-3" />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Manage in Settings
          </div>
          <div className="text-muted-foreground">
            Keys currently in use
          </div>
        </CardFooter>
      </Card>

      {/* CARD 3: Usage (24h) */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Requests (24h)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {total_calls_24h}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconActivity className="mr-1 size-3" />
              Live
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total hits today
          </div>
          <div className="text-muted-foreground">System usage overview</div>
        </CardFooter>
      </Card>

      {/* CARD 4: Health / Success Rate */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Success Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {success_rate}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className={success_rate > 90 ? "text-green-600" : "text-red-600"}>
              <IconServer className="mr-1 size-3" />
              Health
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Based on recent calls
          </div>
          <div className="text-muted-foreground">API uptime metric</div>
        </CardFooter>
      </Card>

    </div>
  );
}