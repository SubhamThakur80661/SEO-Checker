import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FileSearch, Loader2, ArrowRight } from "lucide-react";
import api, { getErrorMessage } from "../lib/api";
import ReportView from "../components/ReportView.jsx";
import { Card, CardBody } from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { LogoMark } from "../components/layout/Sidebar.jsx";

/** Public share view: /report/:id — no login required. */
export default function Report() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/api/audit/report/${id}`)
      .then((res) => setReport(res.data?.data || null))
      .catch((err) => setError(getErrorMessage(err)));
  }, [id]);

  return (
    <div className="min-h-screen bg-paper">
      <header className="no-print border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/login" className="flex items-center gap-2">
            <LogoMark className="h-8 w-8" />
            <span className="font-display text-lg font-bold tracking-tight text-ink">RankVista</span>
          </Link>
          <Link to="/login">
            <Button size="sm">
              Run your own audit <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        {error && (
          <Card>
            <EmptyState
              icon={FileSearch}
              title="This report isn't shared or doesn't exist"
              body="The owner may have unshared it, or the link is wrong. Ask them to share it again."
              action={
                <Link to="/login">
                  <Button>Run your own audit</Button>
                </Link>
              }
            />
          </Card>
        )}

        {!error && !report && (
          <Card>
            <CardBody>
              <p className="flex items-center gap-2 text-sm text-muted">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading report…
              </p>
            </CardBody>
          </Card>
        )}

        {report && (
          <>
            <p className="mb-4 text-sm text-muted">
              Shared RankVista report ·{" "}
              <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
                run your own audit
              </Link>
            </p>
            <ReportView report={report} />
          </>
        )}
      </main>
    </div>
  );
}
