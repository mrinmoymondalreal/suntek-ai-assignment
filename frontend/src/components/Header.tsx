import { useCurrentUser, useLogout } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { LogOutIcon } from "lucide-react";

export default function Header() {
  const { isLoading, data: user } = useCurrentUser();
  const logout = useLogout();
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <div className="mx-auto max-w-4xl">
        <div className="flex justify-between items-center">
          <Avatar>
            <AvatarFallback>
              {user?.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Button variant={"outline"} onClick={logout}>
            <LogOutIcon />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
