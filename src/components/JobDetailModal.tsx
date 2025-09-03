import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { JobPosting } from '@/types/career';
import { 
  MapPin, 
  Briefcase, 
  Calendar,
  Clock,
  DollarSign
} from 'lucide-react';

interface JobDetailModalProps {
  job: JobPosting | null;
  open: boolean;
  onClose: () => void;
}

const JobDetailModal = ({ job, open, onClose }: JobDetailModalProps) => {
  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl mb-2">
                  {job.title}
                </DialogTitle>
                <div className="flex items-center gap-4 text-sm text-gray-800">
                  <span className="font-medium">{job.department}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {job.location}
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {job.experience}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{job.type}</Badge>
                {job.salary && (
                  <Badge className="bg-primary/10 text-primary">
                    {job.salary}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-800 pt-2 border-t border-border">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Apply by {new Date(job.deadline).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Posted {new Date(job.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Job Description
            </h3>
            <div 
              className="text-gray-800 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Key Responsibilities
            </h3>
            <div 
              className="text-gray-800 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: job.responsibilities }}
            />
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Requirements & Qualifications
            </h3>
            <div 
              className="text-gray-800 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: job.requirements }}
            />
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailModal;