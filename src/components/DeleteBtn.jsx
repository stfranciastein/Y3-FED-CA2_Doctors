import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Link } from "react-router";

export default function DeleteBtn({ resource, id }) {
    return (
        <Button asChild variant="outline" size="sm">
            <Link to={`/${resource}/${id}/delete`}>
                <Trash2 size={18} />
            </Link>
        </Button>
    );
}