import { CheckCircle2, Circle } from "lucide-react";
import { PET_NAME_RULES } from "../../constants/petName";

interface PetNameRulesProps {
  name: string;
  id?: string; // for aria-describedby on the input
}

function PetNameRules({ name, id = "pet-name-rules" }: PetNameRulesProps) {
  return (
    <ul id={id} className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
      {PET_NAME_RULES.map((rule) => {
        const passed = rule.test(name);
        return (
          <li
            key={rule.label}
            className={`flex items-center gap-1.5 text-[11px] transition-colors ${
              passed ? "text-emerald-700" : "text-gray-400"
            }`}
          >
            {passed ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
            ) : (
              <Circle className="h-3.5 w-3.5 shrink-0" />
            )}
            <span>{rule.label}</span>
            <span className="sr-only">{passed ? "(done)" : "(not yet)"}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default PetNameRules;
