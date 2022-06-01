import {render, screen} from '@testing-library/react';
import AppSelector from "../AppSelector.tsx";

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

    it('should render icon', function () {
        render(
            <AppSelector options={[{appName: 'val', displayName: 'Value', icon: '/dummy/path'}]}
                         selectedApp={'val'}
                         setSelectedApp={() => null}
            />
        );

        const imgElement = screen.getByTestId('app-selector-icon-img');
        expect(imgElement).toBeInTheDocument();
    });

    it('should not render icon if no icon is set', function () {
        render(
            <AppSelector options={[{appName: 'val', displayName: 'Value'}]}
                         selectedApp={'val'}
                         setSelectedApp={() => null}
            />
        );

        const imgElement = screen.queryByTestId('app-selector-icon-img');
        expect(imgElement).not.toBeInTheDocument();
    });

});
