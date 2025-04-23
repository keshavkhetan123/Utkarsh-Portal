import { Chip, Typography } from "@mui/material";

import SearchUserInput from "~/app/common/components/SearchUserClient";

import { type IndividualParticipantSelectorProps } from "./types";

import { useSession } from "next-auth/react";

export default function IndividualParticipantsSelector(
    props: IndividualParticipantSelectorProps,
) {
    const { data: session } = useSession();

    return (
        <>
            {props.hideSelector ? <></> : <>
                <Typography variant="body2" className="px-1">
                    Select Individual Participants
                </Typography>
                <SearchUserInput
                    label="Search Individual Participant"
                    value={[]}
                    setValue={(_, value) => {
                        console.log(value);
                        props.setIndividualParticipants([
                            ...value,
                            ...props.individualParticipants,
                        ]);
                    }}
                    customAPIFilters={{
                        exclude: props.individualParticipants.map((user) => user.id),
                    }}
                    disabled={props.disabled}
                    year={session?.user?.year}
                />
            </>}
            {props.individualParticipants.length ? (
                <>
                    <Typography variant="caption" className="px-1">
                        {props.individualParticipants.length} individual participants
                        {props.hideSelector ? "" : "selected"}
                    </Typography>
                    <div className="flex flex-row gap-2 flex-wrap max-h-80 overflow-auto">
                        {props.individualParticipants.map((user) => (
                            <Chip
                                key={user.id}
                                label={`${user.name} (${user.username})`}
                                onDelete={
                                    props.disabled
                                        ? undefined
                                        : () =>
                                            props.setIndividualParticipants(
                                                props.individualParticipants.filter(
                                                    (u) => u.id != user.id,
                                                ),
                                            )
                                }
                            />
                        ))}
                    </div>
                </>
            ) : (
                <></>
            )}
        </>
    );
}
