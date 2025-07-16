import { cn } from "@/lib/utils";
import { Marquee } from "./marquee";

const ReviewCard = ({
  name,
  body,
}: {
  name: string;
  body: string;
}) => {
  // Generate a random color
  const randomColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`;

  return (
    <figure
      className={cn(
        "marquee",
      )}
    >
      <div className="flex items-center gap-x-2 -mt-4 -mb-4">
        {/* Profile Circle */}
        <div
          className="rounded-full w-10 h-10 flex items-center justify-center"
          style={{ backgroundColor: randomColor }}
        >
          <span className="text-black font-bold text-lg">
            {name.charAt(0)}
          </span>
        </div>
        {/* Name */}
        <div className="flex flex-row justify-center">
          <p className="text-md font-semibold text-gray-400 dark:text-gray-500">@{name}</p>
        </div>
      </div>
      {/* Review Body */}
      <p className="mt-1 mb-0 text-md text-gray-700 dark:text-gray-300">{body}</p>
    </figure>
  );
};

// Function to shuffle an array in place using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default function MarqueeWrapper({
  reviews,
  transform = "translateX(-100px) translateY(0px) translateZ(-100px) rotateX(15deg) rotateY(-7deg) rotateZ(15deg)",
}: {
  reviews: { name: string; body: string }[];
  transform?: string; // Added transform prop
}) {
  // Shuffle the reviews array
  const shuffledReviews = shuffleArray([...reviews]);

  const firstRow = shuffledReviews.slice(0, shuffledReviews.length / 4);
  const secondRow = shuffledReviews.slice(shuffledReviews.length / 4, 2 * shuffledReviews.length / 4);
  const thirdRow = shuffledReviews.slice(2 * shuffledReviews.length / 4, 3 * shuffledReviews.length / 4);
  const fourthRow = shuffledReviews.slice(3 * shuffledReviews.length / 4, 4 * shuffledReviews.length / 4);

  return (
    <div className="relative z-0 flex h-96 w-full flex-row items-center justify-center gap-4 overflow-hidden [perspective:300px]">
      <div
        className="flex flex-row items-center gap-1"
        style={{
          transform, // Use the customizable transform prop
        }}
      >
        <Marquee pauseOnHover vertical className="[--duration:80s]">
          {firstRow.map((review) => (
            <ReviewCard key={review.name} {...review} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:80s]" vertical>
          {secondRow.map((review) => (
            <ReviewCard key={review.name} {...review} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:80s]" vertical>
          {thirdRow.map((review) => (
            <ReviewCard key={review.name} {...review} />
          ))}
        </Marquee>
        <Marquee pauseOnHover className="[--duration:80s]" vertical>
          {fourthRow.map((review) => (
            <ReviewCard key={review.name} {...review} />
          ))}
        </Marquee>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-background"></div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
    </div>
  );
}