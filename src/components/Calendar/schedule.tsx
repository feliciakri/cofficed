import { parseISO, isSameDay, format } from "date-fns";
import React, { useEffect, useState } from "react";
import { Calendar } from "react-date-range";
import { Button, Tooltip, Text } from "@mantine/core";

type DateProps = {
	data: any;
};

const MyScheduleComponent: React.FC<DateProps> = ({ data }) => {
	const [isDays, setIsDays] = useState<any>([]);
	useEffect(() => {
		if (data) {
			setIsDays(data);
		}
	}, [data]);
	const extraDot = (
		<div
			style={{
				height: "5px",
				width: "5px",
				borderRadius: "100%",
				background: "orange",
				position: "absolute",
				top: 2,
				right: 2,
			}}
		/>
	);

	const daySpan = (day: any) => {
		return <span>{format(day, "d")}</span>;
	};

	function customDayContent(day: any) {
		let comp = null;
		let item = isDays.find((daysp: any) =>
			isSameDay(parseISO(daysp.day), day)
		);
		if (item) {
			comp = (
				<div>
					<Tooltip label={item.office} withArrow>
						<Button variant="subtle">
							{extraDot}
							<Text color="red">{daySpan(day)}</Text>
						</Button>
					</Tooltip>
				</div>
			);
		} else {
			comp = <>{daySpan(day)}</>;
		}
		return comp;
	}

	return (
		<Calendar
			disabledDates={isDays}
			direction="horizontal"
			dayContentRenderer={customDayContent}
		/>
	);
};
export default MyScheduleComponent;
