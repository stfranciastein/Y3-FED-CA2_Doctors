import { Link } from 'react-router';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu" // Import from the ShadCN docs

export default function Navbar() {
    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuLink asChild><Link to=''>Home</Link></NavigationMenuLink>
                </NavigationMenuItem>
               <NavigationMenuItem className="hidden md:block">
                <NavigationMenuTrigger>Doctors</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid w-[200px] gap-4">
                        <li>
                            <NavigationMenuLink asChild>
                            <Link to='/doctors'>All</Link>
                            </NavigationMenuLink>
                            <NavigationMenuLink asChild>
                            <Link href="#">Create</Link>
                            </NavigationMenuLink>
                        </li>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
};

