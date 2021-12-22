import {render, screen} from '@testing-library/react';
import AppSelector from "../AppSelector.jsx";

describe('AppSelector', function () {

    it('should render', function () {
        render(
            <AppSelector options={[{appName: 'val', displayName: 'Value'}]}
                         selectedApp={'val'}
                         setSelectedApp={() => null}
            />
        );
        const linkElement = screen.getAllByText(/Selected App/i);
        expect(linkElement[0]).toBeInTheDocument();
    });

});