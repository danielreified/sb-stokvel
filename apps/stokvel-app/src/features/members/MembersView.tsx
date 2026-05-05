import type { StokvelId } from '@seyva/types';
import { formatDate, formatPhone } from '@seyva/utils';
import { useSuspenseQuery } from '@tanstack/react-query';
import { copy, interpolate } from '../../copy/index.js';
import { membersQueryOptions } from '../dashboard/queries.js';

interface MembersViewProps {
  stokvelId: StokvelId;
}

export function MembersView({ stokvelId }: MembersViewProps) {
  const { data: members } = useSuspenseQuery(membersQueryOptions(stokvelId));

  return (
    <div className="space-y-2 p-4">
      <h1 className="text-xl font-bold text-gray-900">{copy.members.pageTitle}</h1>
      <ul className="space-y-2">
        {members.map((member) => (
          <li
            key={member.id}
            className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100"
          >
            <div>
              <p className="font-medium text-gray-900">{member.name}</p>
              <p className="text-sm text-gray-500">{formatPhone(member.phone)}</p>
            </div>
            <p className="text-xs text-gray-400">
              {interpolate(copy.members.joinedLabel, { date: formatDate(member.joinedAt) })}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
