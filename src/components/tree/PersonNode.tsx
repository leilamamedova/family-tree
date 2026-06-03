'use client';

import { Handle, Position } from 'reactflow';
import clsx from 'clsx';
import Image from 'next/image';

import { formatDate } from '@/lib/date';
import { getFullName } from '@/lib/text';
import { Person } from '@/types/person';

type Props = {
  data: {
    person: Person;
    onClick: (person: Person) => void;
    highlighted?: boolean;
  };
};

export default function PersonNode({ data }: Props) {
  const { person, onClick, highlighted } = data;

  const isDeceased = !!person.deathDate;

  return (
    <div
      onClick={() => onClick(person)}
      className="cursor-pointer flex flex-col items-center"
    >
      <Handle id="child-target" type="target" position={Position.Top} />
      <Handle id="child-source" type="source" position={Position.Bottom} />

      <Handle
        id="spouse-source"
        type="source"
        position={Position.Top}
        style={{ opacity: 0 }}
      />

      <Handle
        id="spouse-target"
        type="target"
        position={Position.Top}
        style={{ opacity: 0 }}
      />

      <div
        className={clsx(
          'w-20 h-20 rounded-full overflow-hidden border-2 relative transition-all duration-200',
          'hover:scale-110 hover:shadow-lg hover:border-blue-500',
          highlighted && 'border-orange-400 shadow-md',
          !highlighted &&
            isDeceased &&
            'grayscale opacity-70 hover:grayscale-0 hover:opacity-100',
        )}
      >
        <Image
          src={person.image || '/placeholder.png'}
          alt={getFullName(person)}
          fill
          sizes="80px"
          className="object-cover"
          loading="eager"
        />
      </div>

      <div className="text-center mt-2 text-xs font-medium">
        <div>{person.firstName}</div>
        <div>{person.lastName}</div>
        {person.patronymic && <div>{person.patronymic}</div>}
      </div>

      <div className="text-[10px] text-gray-500">
        {formatDate(person.birthDate)}
        {person.deathDate ? ` - ${formatDate(person.deathDate)}` : ''}{' '}
      </div>
    </div>
  );
}
