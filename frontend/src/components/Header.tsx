import { useCurrentUser, useLogout } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { LogOutIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useLocation, useNavigate } from "react-router";
import { ModeToggle } from "./mode-toggle";

export default function Header() {
  const { isLoading, data: user } = useCurrentUser();
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  if (isLoading) return <div>Loading...</div>;

  const handleChange = (value: string) => {
    navigate(`${value}`);
  };

  return (
    <div className="p-4">
      <div className="mx-auto max-w-4xl">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <Avatar>
              <AvatarFallback>
                {user?.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Select
              defaultValue={location.pathname}
              onValueChange={(value) => handleChange(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Routes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="/">Home / Dashboard</SelectItem>
                <SelectItem value="/tasks">Tasks</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button variant={"outline"} onClick={logout}>
              <LogOutIcon />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
