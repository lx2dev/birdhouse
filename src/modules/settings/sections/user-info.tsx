"use client"

import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api/client"
import { UpdateProfileModal } from "@/modules/settings/ui/update-profile-modal"

export function UserInfoSection() {
  return (
    <Suspense fallback={<UserInfoSection.Skeleton />}>
      <ErrorBoundary fallback={<UserInfoSection.Error />}>
        <UserInfoSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

function UserInfoSectionSuspense() {
  const [profile] = api.account.getProfile.useSuspenseQuery()

  return (
    <div className="grid @md:grid-cols-3 grid-cols-1 items-center gap-4">
      <div className="self-start">
        <h2 className="font-semibold text-xl tracking-tight">Profile</h2>
      </div>
      <div className="flex items-center gap-x-6">
        <Avatar className="size-14">
          <AvatarImage src={profile.image || ""} />
          <AvatarFallback>{profile.name?.[0] ?? "U"}</AvatarFallback>
        </Avatar>
        <p className="line-clamp-1 font-semibold text-xl leading-none">
          {profile.name}
        </p>
      </div>
      <div className="@md:ml-auto">
        <UpdateProfileModal profile={profile} />
      </div>
    </div>
  )
}

UserInfoSection.Skeleton = () => (
  <div className="grid @md:grid-cols-3 grid-cols-1 items-center gap-4">
    <div className="self-start">
      <h2 className="font-semibold text-xl tracking-tight">Profile</h2>
    </div>
    <div className="flex items-center gap-x-6">
      <Skeleton className="size-14 rounded-full" />
      <Skeleton className="h-6 w-48" />
    </div>
    <div className="@md:ml-auto">
      <Button disabled variant="outline">
        Update Profile
      </Button>
    </div>
  </div>
)

UserInfoSection.Error = () => (
  <div className="grid @md:grid-cols-3 grid-cols-1 items-center gap-4">
    <div className="self-start">
      <p className="text-destructive">Failed to load profile</p>
    </div>
  </div>
)
