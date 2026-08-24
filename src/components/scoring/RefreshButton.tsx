import { useState } from "react";
import { useRefreshQueries } from "@/api/queries";
import StyledButton from "@/components/common/StyledButton";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function RefreshButton() {
  const refreshQueries = useRefreshQueries();
  const [isPending, setIsPending] = useState(false);

  const handleRefresh = async () => {
    setIsPending(true);
    await refreshQueries();
    setIsPending(false);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {isPending ? (
        <LoadingSpinner />
      ) : (
        <StyledButton label={"Update Scores"} type="button" onClick={handleRefresh} />
      )}
    </div>
  );
}
